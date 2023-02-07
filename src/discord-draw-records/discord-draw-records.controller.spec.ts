import { Test, TestingModule } from '@nestjs/testing';
import { DiscordDrawRecordsController } from './discord-draw-records.controller';
import { DiscordDrawRecordsService } from './discord-draw-records.service';

describe('DiscordDrawRecordsController', () => {
  let controller: DiscordDrawRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordDrawRecordsController],
      providers: [DiscordDrawRecordsService],
    }).compile();

    controller = module.get<DiscordDrawRecordsController>(DiscordDrawRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
