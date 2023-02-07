import { Test, TestingModule } from '@nestjs/testing';
import { DiscordDrawCampaignsService } from './discord-draw-campaigns.service';

describe('DiscordDrawCampaignsService', () => {
  let service: DiscordDrawCampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordDrawCampaignsService],
    }).compile();

    service = module.get<DiscordDrawCampaignsService>(DiscordDrawCampaignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
