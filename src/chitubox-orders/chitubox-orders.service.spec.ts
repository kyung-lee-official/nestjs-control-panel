import { Test, TestingModule } from '@nestjs/testing';
import { ChituboxOrdersService } from './chitubox-orders.service';

describe('ChituboxOrdersService', () => {
  let service: ChituboxOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChituboxOrdersService],
    }).compile();

    service = module.get<ChituboxOrdersService>(ChituboxOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
