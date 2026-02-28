import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, UpdateItemDto, ItemFilterDto } from './dto/item.dto';
import { ItemStatus, Prisma, Role } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateItemDto, userId: string) {
    const item = await this.prisma.item.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        type: dto.type,
        location: dto.location,
        building: dto.building,
        floor: dto.floor,
        dateLostFound: (() => {
          const d = new Date(dto.dateLostFound);
          if (d > new Date())
            throw new BadRequestException('Date cannot be in the future');
          return d;
        })(),
        imageUrl: dto.imageUrl,
        tags: dto.tags || [],
        reporterId: userId,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Trigger matching engine asynchronously
    this.matchingService.findMatches(item).catch(console.error);

    return item;
  }

  async findAll(filter: ItemFilterDto) {
    const page = Number(filter.page) || 1;
    const limit = Math.min(Number(filter.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {};
    if (filter.type) where.type = filter.type;
    if (filter.category)
      where.category = { contains: filter.category, mode: 'insensitive' };
    if (filter.status) where.status = filter.status;
    if (filter.location)
      where.location = { contains: filter.location, mode: 'insensitive' };
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { tags: { has: filter.search.toLowerCase() } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { claims: true, lostMatches: true, foundMatches: true },
          },
        },
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        lostMatches: {
          include: {
            foundItem: {
              include: { reporter: { select: { id: true, name: true } } },
            },
            chatRoom: true,
          },
        },
        foundMatches: {
          include: {
            lostItem: {
              include: { reporter: { select: { id: true, name: true } } },
            },
            chatRoom: true,
          },
        },
        claims: {
          include: {
            claimant: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, dto: UpdateItemDto, userId: string, userRole: Role) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    if (
      item.reporterId !== userId &&
      !([Role.ADMIN, Role.SECURITY] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('You can only edit your own items');
    }

    if (item.status !== ItemStatus.ACTIVE) {
      throw new BadRequestException('Can only edit items with ACTIVE status');
    }

    return this.prisma.item.update({
      where: { id },
      data: {
        ...dto,
        dateLostFound: dto.dateLostFound
          ? (() => {
              const d = new Date(dto.dateLostFound);
              if (d > new Date())
                throw new BadRequestException('Date cannot be in the future');
              return d;
            })()
          : undefined,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    if (
      item.reporterId !== userId &&
      !([Role.ADMIN, Role.SECURITY] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('You can only delete your own items');
    }

    await this.prisma.item.delete({ where: { id } });
    return { message: 'Item deleted successfully' };
  }

  async getMyItems(userId: string) {
    return this.prisma.item.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { claims: true, lostMatches: true, foundMatches: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: ItemStatus) {
    // Bug #4 fix: check existence before updating
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    return this.prisma.item.update({
      where: { id },
      data: { status },
    });
  }
}
