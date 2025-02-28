import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDataCollectorService } from './youtube-data-collector.service';

describe('YoutubeDataCollectorService', () => {
  let service: YoutubeDataCollectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeDataCollectorService],
    }).compile();

    service = module.get<YoutubeDataCollectorService>(YoutubeDataCollectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
