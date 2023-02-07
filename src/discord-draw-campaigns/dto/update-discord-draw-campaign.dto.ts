import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscordDrawCampaignDto } from './create-discord-draw-campaign.dto';

export class UpdateDiscordDrawCampaignDto extends PartialType(CreateDiscordDrawCampaignDto) {}
