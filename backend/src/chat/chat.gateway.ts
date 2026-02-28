import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/types/auth-user';

type SocketWithUser = Omit<Socket, 'data'> & { data: { user?: AuthUser } };

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId → userId

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    void server;
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authedClient = client as SocketWithUser;
      const rawAuthHeader = client.handshake.headers?.authorization;
      const authHeader =
        typeof rawAuthHeader === 'string'
          ? rawAuthHeader
          : Array.isArray(rawAuthHeader)
            ? rawAuthHeader[0]
            : undefined;

      const handshakeAuth = client.handshake.auth as
        | { token?: string }
        | undefined;
      const token = handshakeAuth?.token || authHeader?.split(' ')[1];

      if (!token) {
        this.logger.warn(`No token provided by client ${client.id}`);
        throw new UnauthorizedException('No token');
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret:
          process.env.JWT_SECRET ||
          'your-super-secret-jwt-key-change-in-production',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          studentId: true,
        },
      });
      if (!user) throw new UnauthorizedException('User not found');

      this.connectedUsers.set(client.id, user.id);
      authedClient.data.user = user;
      this.logger.log(`Client connected: ${client.id} (${user.name})`);

      client.emit('connected', { userId: user.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Unauthorized connection attempt: ${client.id} - ${message}`,
      );
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const authedClient = client as SocketWithUser;
    if (!data?.roomId) return { error: 'Invalid room id' };

    const userId = authedClient.data.user?.id;
    if (!userId) {
      this.logger.warn(`JoinRoom unauthorized: No userId in socket data`);
      return { error: 'Unauthorized' };
    }

    try {
      // Verify user is participant
      const participant = await this.prisma.chatRoomParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: data.roomId, userId } },
      });

      if (!participant) {
        this.logger.warn(`User ${userId} denied access to room ${data.roomId}`);
        return { error: 'Access denied to this chat room' };
      }

      await authedClient.join(data.roomId);
      this.logger.log(`User ${userId} joined room ${data.roomId}`);

      // Send last 50 messages (most recent 50, returned oldest→newest for UI)
      const messagesDesc = await this.prisma.message.findMany({
        where: { chatRoomId: data.roomId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // Return data for the acknowledgment callback
      return { messages: messagesDesc.reverse() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error joining room: ${message}`);
      return { error: 'Internal server error' };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const authedClient = client as SocketWithUser;
    if (!data?.roomId) return { error: 'Invalid room id' };

    const userId = authedClient.data.user?.id;
    if (!userId) return { error: 'Unauthorized' };

    if (!data.content?.trim()) return { error: 'Message cannot be empty' };

    // Verify room participant
    const participant = await this.prisma.chatRoomParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId: data.roomId, userId } },
    });
    if (!participant) return { error: 'Access denied' };

    // Bug #12 fix: prevent sending to closed/inactive rooms
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: data.roomId },
    });
    if (!room || !room.isActive) return { error: 'This chat room is closed' };

    // Persist message
    const message = await this.prisma.message.create({
      data: {
        chatRoomId: data.roomId,
        senderId: userId,
        content: data.content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Broadcast to room
    this.server.to(data.roomId).emit('newMessage', message);
    return { event: 'messageSent', data: message };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const authedClient = client as SocketWithUser;
    const user = authedClient.data.user;
    if (!user) return;
    client.to(data.roomId).emit('userTyping', {
      userId: user.id,
      name: user.name,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const authedClient = client as SocketWithUser;
    const userId = authedClient.data.user?.id;
    if (!userId) return;

    await this.prisma.message.updateMany({
      where: {
        chatRoomId: data.roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    client
      .to(data.roomId)
      .emit('messagesRead', { userId, roomId: data.roomId });
  }

  // Called from ChatService to push notification to specific user
  sendToUser(userId: string, event: string, data: unknown) {
    for (const [socketId, uid] of this.connectedUsers.entries()) {
      if (uid === userId) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}
