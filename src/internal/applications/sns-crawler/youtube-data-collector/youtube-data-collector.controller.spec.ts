import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDataCollectorController } from './youtube-data-collector.controller';
import { YoutubeDataCollectorService } from './youtube-data-collector.service';

describe('YoutubeDataCollectorController', () => {
  let controller: YoutubeDataCollectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeDataCollectorController],
      providers: [YoutubeDataCollectorService],
    }).compile();

    controller = module.get<YoutubeDataCollectorController>(YoutubeDataCollectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
