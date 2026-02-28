import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto, ItemFilterDto } from './dto/item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a lost or found item' })
  create(@Body() dto: CreateItemDto, @CurrentUser() user: AuthUser) {
    return this.itemsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all items with filters' })
  findAll(@Query() filter: ItemFilterDto) {
    return this.itemsService.findAll(filter);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reported items' })
  getMyItems(@CurrentUser() user: AuthUser) {
    return this.itemsService.getMyItems(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item details' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itemsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an item' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.itemsService.remove(id, user.id, user.role);
  }
}
