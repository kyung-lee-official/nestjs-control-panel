import { Test, TestingModule } from '@nestjs/testing';
import { DiscordDrawRecordsService } from './discord-draw-records.service';

describe('DiscordDrawRecordsService', () => {
  let service: DiscordDrawRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordDrawRecordsService],
    }).compile();

    service = module.get<DiscordDrawRecordsService>(DiscordDrawRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
