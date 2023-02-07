import { Injectable } from '@nestjs/common';
import { CreateDiscordDrawCampaignDto } from './dto/create-discord-draw-campaign.dto';
import { UpdateDiscordDrawCampaignDto } from './dto/update-discord-draw-campaign.dto';

@Injectable()
export class DiscordDrawCampaignsService {
  create(createDiscordDrawCampaignDto: CreateDiscordDrawCampaignDto) {
    return 'This action adds a new discordDrawCampaign';
  }

  findAll() {
    return `This action returns all discordDrawCampaigns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discordDrawCampaign`;
  }

  update(id: number, updateDiscordDrawCampaignDto: UpdateDiscordDrawCampaignDto) {
    return `This action updates a #${id} discordDrawCampaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} discordDrawCampaign`;
  }
}
