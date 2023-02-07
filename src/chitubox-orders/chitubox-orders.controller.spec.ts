import { Test, TestingModule } from '@nestjs/testing';
import { ChituboxOrdersController } from './chitubox-orders.controller';
import { ChituboxOrdersService } from './chitubox-orders.service';

describe('ChituboxOrdersController', () => {
  let controller: ChituboxOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChituboxOrdersController],
      providers: [ChituboxOrdersService],
    }).compile();

    controller = module.get<ChituboxOrdersController>(ChituboxOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
