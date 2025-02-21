import { Test, TestingModule } from '@nestjs/testing';
import { FacebookGroupService } from './facebook-group.service';

describe('FacebookGroupService', () => {
  let service: FacebookGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacebookGroupService],
    }).compile();

    service = module.get<FacebookGroupService>(FacebookGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
