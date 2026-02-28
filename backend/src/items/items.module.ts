import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MatchingModule, NotificationsModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
