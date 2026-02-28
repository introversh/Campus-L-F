import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AuthUser } from '../auth/types/auth-user';

class RejectMatchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags('matches')
@Controller('matches')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  @ApiOperation({ summary: 'Get my matches' })
  getMyMatches(@CurrentUser() user: AuthUser) {
    return this.matchingService.getUserMatches(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match details' })
  getMatch(@Param('id') id: string) {
    return this.matchingService.getMatchById(id);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECURITY)
  @ApiOperation({ summary: 'Confirm a match (Admin/Security)' })
  confirmMatch(@Param('id') id: string) {
    return this.matchingService.confirmMatch(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECURITY)
  @ApiOperation({ summary: 'Reject a match (Admin/Security)' })
  rejectMatch(@Param('id') id: string, @Body() dto: RejectMatchDto) {
    return this.matchingService.rejectMatch(id, dto.note);
  }

  @Post(':id/open-chat')
  @ApiOperation({
    summary: 'Open or create a chat room for this match (any participant)',
  })
  openChat(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.matchingService.openChat(id, user.id);
  }
}
