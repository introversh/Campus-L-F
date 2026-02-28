import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { MatchingModule } from './matching/matching.module';
import { ChatModule } from './chat/chat.module';
import { ClaimsModule } from './claims/claims.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 10000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    MatchingModule,
    ChatModule,
    ClaimsModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
