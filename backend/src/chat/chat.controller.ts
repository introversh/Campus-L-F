import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user';

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Get my chat rooms' })
  getMyRooms(@CurrentUser() user: AuthUser) {
    return this.chatService.getUserRooms(user.id);
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get a specific chat room' })
  getRoom(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chatService.getRoom(id, user.id);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Get messages in a room (paginated)' })
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(id, user.id, +page, +limit);
  }
}
