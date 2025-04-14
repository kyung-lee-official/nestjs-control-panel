import { Test, TestingModule } from '@nestjs/testing';
import { SalesDataController } from './sales-data.controller';
import { SalesDataService } from './sales-data.service';

describe('SalesDataController', () => {
  let controller: SalesDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesDataController],
      providers: [SalesDataService],
    }).compile();

    controller = module.get<SalesDataController>(SalesDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
