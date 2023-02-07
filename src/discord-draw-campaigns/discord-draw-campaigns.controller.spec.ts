import { Test, TestingModule } from '@nestjs/testing';
import { DiscordDrawCampaignsController } from './discord-draw-campaigns.controller';
import { DiscordDrawCampaignsService } from './discord-draw-campaigns.service';

describe('DiscordDrawCampaignsController', () => {
  let controller: DiscordDrawCampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordDrawCampaignsController],
      providers: [DiscordDrawCampaignsService],
    }).compile();

    controller = module.get<DiscordDrawCampaignsController>(DiscordDrawCampaignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
