import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Item, ItemType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private chatService: ChatService,
  ) {}

  async findMatches(newItem: Item): Promise<void> {
    // Only match against opposite type, active items
    const oppositeType =
      newItem.type === ItemType.LOST ? ItemType.FOUND : ItemType.LOST;

    const candidates = await this.prisma.item.findMany({
      where: {
        type: oppositeType,
        status: 'ACTIVE',
        id: { not: newItem.id },
      },
      include: { reporter: { select: { id: true, name: true } } },
    });

    // Bug #2 fix: collect all matches first, THEN update statuses
    // so the new item isn't set to MATCHED mid-loop, corrupting further checks.
    const matchesToCreate: {
      lostItemId: string;
      foundItemId: string;
      score: number;
      candidate: (typeof candidates)[0];
    }[] = [];

    for (const candidate of candidates) {
      const score = this.computeScore(newItem, candidate);
      if (score >= 40) {
        const existing = await this.prisma.match.findFirst({
          where: {
            OR: [
              { lostItemId: newItem.id, foundItemId: candidate.id },
              { lostItemId: candidate.id, foundItemId: newItem.id },
            ],
          },
        });
        if (existing) continue;

        matchesToCreate.push({
          lostItemId:
            newItem.type === ItemType.LOST ? newItem.id : candidate.id,
          foundItemId:
            newItem.type === ItemType.FOUND ? newItem.id : candidate.id,
          score,
          candidate,
        });
      }
    }

    // BUG-14 fix: cap at top-5 matches by score to prevent unbounded PENDING matches per item
    matchesToCreate.sort((a, b) => b.score - a.score);
    const topMatches = matchesToCreate.slice(0, 5);
    // Now create matches and update statuses
    for (const { lostItemId, foundItemId, score } of topMatches) {
      try {
        const match = await this.prisma.match.create({
          data: { lostItemId, foundItemId, confidenceScore: score },
          include: {
            lostItem: { include: { reporter: true } },
            foundItem: { include: { reporter: true } },
          },
        });

        // Update item statuses to MATCHED
        await Promise.all([
          this.prisma.item.update({
            where: { id: lostItemId },
            data: { status: 'MATCHED' },
          }),
          this.prisma.item.update({
            where: { id: foundItemId },
            data: { status: 'MATCHED' },
          }),
        ]);

        // Notify both reporters
        await Promise.all([
          this.notificationsService.create({
            userId: match.lostItem.reporterId,
            type: 'MATCH_FOUND',
            title: '🎯 Potential Match Found!',
            body: `Your lost item "${match.lostItem.title}" has a ${Math.round(score)}% match with a found item.`,
            data: { matchId: match.id },
          }),
          this.notificationsService.create({
            userId: match.foundItem.reporterId,
            type: 'MATCH_FOUND',
            title: '🎯 Potential Match Found!',
            body: `Your found item "${match.foundItem.title}" may belong to someone who reported it lost.`,
            data: { matchId: match.id },
          }),
        ]);

        this.logger.log(
          `Match created: ${lostItemId} ↔ ${foundItemId} (score: ${score})`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to create match: ${message}`);
      }
    }
  }

  // ─── Scoring Algorithm ────────────────────────────────────────────────────────
  private computeScore(a: Item, b: Item): number {
    let score = 0;

    // 1) Category match (30 pts)
    if (a.category.toLowerCase() === b.category.toLowerCase()) {
      score += 30;
    } else if (
      a.category.toLowerCase().includes(b.category.toLowerCase()) ||
      b.category.toLowerCase().includes(a.category.toLowerCase())
    ) {
      score += 15;
    }

    // 2) Keyword similarity via Jaccard index (max 40 pts)
    const aTokens = this.tokenize(
      `${a.title} ${a.description} ${a.tags.join(' ')}`,
    );
    const bTokens = this.tokenize(
      `${b.title} ${b.description} ${b.tags.join(' ')}`,
    );
    const jaccard = this.jaccardSimilarity(aTokens, bTokens);
    score += jaccard * 40;

    // 3) Location proximity (max 20 pts)
    const aLoc = a.location.toLowerCase();
    const bLoc = b.location.toLowerCase();
    if (aLoc === bLoc) {
      score += 20;
    } else if (aLoc.includes(bLoc) || bLoc.includes(aLoc)) {
      score += 10;
    } else {
      // Check if building matches
      if (
        a.building &&
        b.building &&
        a.building.toLowerCase() === b.building.toLowerCase()
      ) {
        score += 5;
      }
    }

    // 4) Date proximity (max 10 pts)
    const daysDiff =
      Math.abs(
        new Date(a.dateLostFound).getTime() -
          new Date(b.dateLostFound).getTime(),
      ) /
      (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) score += 10;
    else if (daysDiff <= 3) score += 7;
    else if (daysDiff <= 7) score += 5;
    else if (daysDiff <= 14) score += 2;

    return Math.min(score, 100);
  }

  private tokenize(text: string): Set<string> {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'is',
      'in',
      'on',
      'at',
      'to',
      'of',
      'and',
      'or',
      'with',
      'my',
      'i',
    ]);
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w)),
    );
  }

  private jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;
    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
  }

  async getMatchById(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        lostItem: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        foundItem: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        chatRoom: true,
        claims: true,
      },
    });
  }

  async getUserMatches(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [
          { lostItem: { reporterId: userId } },
          { foundItem: { reporterId: userId } },
        ],
      },
      include: {
        lostItem: {
          include: { reporter: { select: { id: true, name: true } } },
        },
        foundItem: {
          include: { reporter: { select: { id: true, name: true } } },
        },
        chatRoom: true,
      },
      orderBy: { confidenceScore: 'desc' },
    });
  }

  async confirmMatch(matchId: string) {
    // Bug #7 fix: check existence and current status
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        lostItem: {
          include: { reporter: { select: { id: true, name: true } } },
        },
        foundItem: {
          include: { reporter: { select: { id: true, name: true } } },
        },
      },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.status !== 'PENDING')
      throw new BadRequestException(`Match is already ${match.status}`);

    const confirmed = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'CONFIRMED' },
    });

    // BUG-06 fix: create chat room + send notifications on confirm
    await Promise.all([
      this.chatService.createRoom(
        matchId,
        match.lostItem.reporterId,
        match.foundItem.reporterId,
      ),
      this.notificationsService.create({
        userId: match.lostItem.reporterId,
        type: 'MATCH_FOUND',
        title: '🎉 Match Confirmed!',
        body: `Your lost item "${match.lostItem.title}" has been matched. A chat room has been created.`,
        data: { matchId },
      }),
      this.notificationsService.create({
        userId: match.foundItem.reporterId,
        type: 'MATCH_FOUND',
        title: '🎉 Match Confirmed!',
        body: `Your found item "${match.foundItem.title}" has been matched. A chat room has been created.`,
        data: { matchId },
      }),
    ]);

    return confirmed;
  }

  async rejectMatch(matchId: string, note?: string) {
    // Bug #7 fix: check existence
    const existing = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!existing) throw new NotFoundException('Match not found');

    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'REJECTED', adminNote: note },
    });

    // Bug #13 fix: only revert items to ACTIVE if they have no other non-rejected matches
    const [lostOtherMatches, foundOtherMatches] = await Promise.all([
      this.prisma.match.count({
        where: {
          lostItemId: match.lostItemId,
          id: { not: matchId },
          status: { not: 'REJECTED' },
        },
      }),
      this.prisma.match.count({
        where: {
          foundItemId: match.foundItemId,
          id: { not: matchId },
          status: { not: 'REJECTED' },
        },
      }),
    ]);

    await Promise.all([
      lostOtherMatches === 0
        ? this.prisma.item.update({
            where: { id: match.lostItemId },
            data: { status: 'ACTIVE' },
          })
        : Promise.resolve(),
      foundOtherMatches === 0
        ? this.prisma.item.update({
            where: { id: match.foundItemId },
            data: { status: 'ACTIVE' },
          })
        : Promise.resolve(),
    ]);

    return match;
  }

  async openChat(matchId: string, requestingUserId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        lostItem: { select: { reporterId: true, title: true } },
        foundItem: { select: { reporterId: true, title: true } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');

    const isParticipant =
      match.lostItem.reporterId === requestingUserId ||
      match.foundItem.reporterId === requestingUserId;

    if (!isParticipant) {
      throw new BadRequestException('You are not a participant in this match');
    }

    if (match.status === 'REJECTED') {
      throw new BadRequestException('Cannot open a chat for a rejected match');
    }

    // createRoom is idempotent — returns existing room if already created
    const chatRoom = await this.chatService.createRoom(
      matchId,
      match.lostItem.reporterId,
      match.foundItem.reporterId,
    );

    return chatRoom;
  }
}
