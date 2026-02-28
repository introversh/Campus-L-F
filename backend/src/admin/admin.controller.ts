import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics & statistics' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (paginated)' })
  getUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllUsers(+page, +limit);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all chat rooms for audit' })
  getChats(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllChats(+page, +limit);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all items for moderation' })
  getItems(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllItems(+page, +limit);
  }
}
