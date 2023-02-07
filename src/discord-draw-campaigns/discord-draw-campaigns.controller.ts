import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscordDrawCampaignsService } from './discord-draw-campaigns.service';
import { CreateDiscordDrawCampaignDto } from './dto/create-discord-draw-campaign.dto';
import { UpdateDiscordDrawCampaignDto } from './dto/update-discord-draw-campaign.dto';

@Controller('discord-draw-campaigns')
export class DiscordDrawCampaignsController {
  constructor(private readonly discordDrawCampaignsService: DiscordDrawCampaignsService) {}

  @Post()
  create(@Body() createDiscordDrawCampaignDto: CreateDiscordDrawCampaignDto) {
    return this.discordDrawCampaignsService.create(createDiscordDrawCampaignDto);
  }

  @Get()
  findAll() {
    return this.discordDrawCampaignsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discordDrawCampaignsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscordDrawCampaignDto: UpdateDiscordDrawCampaignDto) {
    return this.discordDrawCampaignsService.update(+id, updateDiscordDrawCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discordDrawCampaignsService.remove(+id);
  }
}
