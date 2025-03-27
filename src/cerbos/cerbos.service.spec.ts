import { Test, TestingModule } from '@nestjs/testing';
import { CerbosService } from './cerbos.service';

describe('CerbosService', () => {
  let service: CerbosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CerbosService],
    }).compile();

    service = module.get<CerbosService>(CerbosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
