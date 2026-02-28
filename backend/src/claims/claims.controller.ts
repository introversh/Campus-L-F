import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto, ReviewClaimDto } from './dto/claim.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user';

@ApiTags('claims')
@Controller('claims')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a claim for an item' })
  create(@Body() dto: CreateClaimDto, @CurrentUser() user: AuthUser) {
    return this.claimsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get my claims' })
  findMy(@CurrentUser() user: AuthUser) {
    return this.claimsService.findAll(user.id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECURITY)
  @ApiOperation({ summary: 'Get all claims (Admin)' })
  findAll() {
    return this.claimsService.findAllAdmin();
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECURITY)
  @ApiOperation({ summary: 'Approve a claim (Admin)' })
  approve(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return this.claimsService.approve(id, dto);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECURITY)
  @ApiOperation({ summary: 'Reject a claim (Admin)' })
  reject(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return this.claimsService.reject(id, dto);
  }
}
