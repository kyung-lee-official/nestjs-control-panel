import { Module } from '@nestjs/common';
import { DiscordDrawRecordsService } from './discord-draw-records.service';
import { DiscordDrawRecordsController } from './discord-draw-records.controller';

@Module({
  controllers: [DiscordDrawRecordsController],
  providers: [DiscordDrawRecordsService]
})
export class DiscordDrawRecordsModule {}
