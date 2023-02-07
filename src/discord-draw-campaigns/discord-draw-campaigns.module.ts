import { Module } from '@nestjs/common';
import { DiscordDrawCampaignsService } from './discord-draw-campaigns.service';
import { DiscordDrawCampaignsController } from './discord-draw-campaigns.controller';

@Module({
  controllers: [DiscordDrawCampaignsController],
  providers: [DiscordDrawCampaignsService]
})
export class DiscordDrawCampaignsModule {}
