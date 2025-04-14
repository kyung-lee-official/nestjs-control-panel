import { Test, TestingModule } from '@nestjs/testing';
import { SalesDataService } from './sales-data.service';

describe('SalesDataService', () => {
  let service: SalesDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesDataService],
    }).compile();

    service = module.get<SalesDataService>(SalesDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
