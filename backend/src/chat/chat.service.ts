import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(matchId: string, user1Id: string, user2Id: string) {
    // Check if room already exists
    const existing = await this.prisma.chatRoom.findUnique({
      where: { matchId },
    });
    if (existing) return existing;

    const room = await this.prisma.chatRoom.create({
      data: {
        matchId,
        participants: {
          create: [{ userId: user1Id }, { userId: user2Id }],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    return room;
  }

  async getRoom(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        match: {
          include: {
            lostItem: true,
            foundItem: true,
          },
        },
      },
    });
    if (!room) throw new NotFoundException('Chat room not found');

    const isParticipant = room.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new ForbiddenException('Not a participant of this room');

    return room;
  }

  async getUserRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        participants: { some: { userId } },
        isActive: true,
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
        match: {
          include: {
            lostItem: { select: { title: true } },
            foundItem: { select: { title: true } },
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async closeRoom(roomId: string) {
    return this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { isActive: false },
    });
  }

  async getMessages(roomId: string, userId: string, page = 1, limit = 50) {
    const participant = await this.prisma.chatRoomParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatRoomId: roomId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.message.count({ where: { chatRoomId: roomId } }),
    ]);

    return {
      data: messages.reverse(),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
