import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AuthUser } from '../auth/types/auth-user';

class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        phone: true,
        department: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { items: true, claims: true } },
      },
    });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        department: true,
        avatarUrl: true,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user public profile' })
  async getUser(@Param('id') id: string) {
    // Bug #5 fix: return 404 instead of null with 200
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
