import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto, ReviewClaimDto } from './dto/claim.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private chatService: ChatService,
  ) {}

  async create(dto: CreateClaimDto, claimantId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: dto.itemId },
      include: { reporter: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.reporterId === claimantId)
      throw new ForbiddenException("You can't claim your own item");

    const existing = await this.prisma.claim.findFirst({
      where: { itemId: dto.itemId, claimantId, status: 'PENDING' },
    });
    if (existing)
      throw new BadRequestException(
        'You already have a pending claim for this item',
      );

    const claim = await this.prisma.claim.create({
      data: {
        itemId: dto.itemId,
        matchId: dto.matchId,
        claimantId,
        description: dto.description,
      },
      include: {
        claimant: { select: { id: true, name: true, email: true } },
        item: { select: { id: true, title: true, reporterId: true } },
      },
    });

    // Notify item reporter
    await this.notificationsService.create({
      userId: item.reporterId,
      type: 'CLAIM_SUBMITTED',
      title: '📋 New Claim Submitted',
      body: `Someone has claimed your item "${item.title}". An admin will review shortly.`,
      data: { claimId: claim.id, itemId: item.id },
    });

    return claim;
  }

  async findAll(userId: string) {
    return this.prisma.claim.findMany({
      where: { claimantId: userId },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
            type: true,
            status: true,
          },
        },
        match: { select: { id: true, confidenceScore: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.claim.findMany({
      include: {
        claimant: {
          select: { id: true, name: true, email: true, studentId: true },
        },
        item: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        match: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(claimId: string, dto: ReviewClaimDto) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: { include: { reporter: true } }, claimant: true },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'PENDING')
      throw new BadRequestException('Claim already reviewed');

    // Transactional: approve claim + update item status + close chat room
    await this.prisma.$transaction(async (tx) => {
      await tx.claim.update({
        where: { id: claimId },
        data: { status: 'APPROVED', adminNote: dto.adminNote },
      });
      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' },
      });

      // Bug #3 fix: always reject other pending claims, not just when matchId exists
      await tx.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claimId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED', adminNote: 'Another claim was approved' },
      });

      // Close matched item too if exists
      if (claim.matchId) {
        const match = await tx.match.findUnique({
          where: { id: claim.matchId },
        });
        if (match) {
          const otherItemId =
            match.lostItemId === claim.itemId
              ? match.foundItemId
              : match.lostItemId;
          await tx.item.update({
            where: { id: otherItemId },
            data: { status: 'CLOSED' },
          });
        }
      }
    });

    // Notify claimant
    await this.notificationsService.create({
      userId: claim.claimantId,
      type: 'CLAIM_APPROVED',
      title: '✅ Claim Approved!',
      body: `Your claim for "${claim.item.title}" has been approved. Please collect your item.`,
      data: { claimId },
    });

    // Create chat room if match exists
    if (claim.matchId) {
      const match = await this.prisma.match.findUnique({
        where: { id: claim.matchId },
        include: { lostItem: true, foundItem: true },
      });
      if (
        match &&
        !(await this.prisma.chatRoom.findUnique({
          where: { matchId: claim.matchId },
        }))
      ) {
        await this.chatService.createRoom(
          claim.matchId,
          match.lostItem.reporterId,
          match.foundItem.reporterId,
        );
      }
    }

    return { message: 'Claim approved successfully' };
  }

  async reject(claimId: string, dto: ReviewClaimDto) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: true, claimant: true },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'PENDING')
      throw new BadRequestException('Claim already reviewed');

    await this.prisma.claim.update({
      where: { id: claimId },
      data: { status: 'REJECTED', adminNote: dto.adminNote },
    });

    await this.notificationsService.create({
      userId: claim.claimantId,
      type: 'CLAIM_REJECTED',
      title: '❌ Claim Rejected',
      body: `Your claim for "${claim.item.title}" was not approved. ${dto.adminNote || ''}`,
      data: { claimId },
    });

    return { message: 'Claim rejected' };
  }
}
