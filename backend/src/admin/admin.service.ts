import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    type MonthlyTrendRow = { month: Date; type: string; count: number };
    type AvgResolutionRow = { avg_hours: number | null };

    const [
      totalItems,
      lostItems,
      foundItems,
      claimedItems,
      closedItems,
      totalMatches,
      confirmedMatches,
      activeChats,
      totalUsers,
      categoryStats,
      locationStats,
      monthlyTrends,
      avgResolutionTime,
    ] = await Promise.all([
      this.prisma.item.count(),
      this.prisma.item.count({ where: { type: 'LOST' } }),
      this.prisma.item.count({ where: { type: 'FOUND' } }),
      this.prisma.item.count({ where: { status: 'CLAIMED' } }),
      this.prisma.item.count({ where: { status: 'CLOSED' } }),
      this.prisma.match.count(),
      this.prisma.match.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.chatRoom.count({ where: { isActive: true } }),
      this.prisma.user.count(),

      // Top categories
      this.prisma.item.groupBy({
        by: ['category', 'type'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),

      // Top loss locations
      this.prisma.item.groupBy({
        by: ['location'],
        _count: { location: true },
        where: { type: 'LOST' },
        orderBy: { _count: { location: 'desc' } },
        take: 8,
      }),

      // Monthly trends (last 6 months)
      this.prisma.$queryRaw<MonthlyTrendRow[]>`
        SELECT
          DATE_TRUNC('month', "createdAt") AS month,
          type,
          COUNT(*)::int AS count
        FROM items
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt"), type
        ORDER BY month ASC
      `,

      // Average resolution time (CLAIMED items only)
      this.prisma.$queryRaw<AvgResolutionRow[]>`
        SELECT AVG(ABS(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))) / 3600)::float AS avg_hours
        FROM items
        WHERE status = 'CLAIMED'
      `,
    ]);

    const recoveryRate =
      totalItems > 0
        ? Math.round(((claimedItems + closedItems) / totalItems) * 100)
        : 0;

    return {
      summary: {
        totalItems,
        lostItems,
        foundItems,
        claimedItems,
        closedItems,
        totalMatches,
        confirmedMatches,
        activeChats,
        totalUsers,
        recoveryRate,
        avgResolutionHours: avgResolutionTime[0]?.avg_hours ?? 0,
      },
      categoryStats: categoryStats.map((s) => ({
        category: s.category,
        type: s.type,
        count: s._count.category,
      })),
      locationStats: locationStats.map((l) => ({
        location: l.location,
        count: l._count.location,
      })),
      monthlyTrends,
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studentId: true,
          department: true,
          phone: true,
          createdAt: true,
          _count: { select: { items: true, claims: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      // Bug #8 fix: type is now Role enum, no unsafe cast needed
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async getAllChats(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [chats, total] = await Promise.all([
      this.prisma.chatRoom.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          messages: { orderBy: { createdAt: 'desc' }, take: 3 },
          match: {
            include: {
              lostItem: { select: { title: true } },
              foundItem: { select: { title: true } },
            },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.chatRoom.count(),
    ]);
    return {
      data: chats,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllItems(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: { select: { claims: true } },
        },
      }),
      this.prisma.item.count(),
    ]);
    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
