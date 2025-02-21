import { Test, TestingModule } from '@nestjs/testing';
import { FacebookGroupController } from './facebook-group.controller';
import { FacebookGroupService } from './facebook-group.service';

describe('FacebookGroupController', () => {
  let controller: FacebookGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacebookGroupController],
      providers: [FacebookGroupService],
    }).compile();

    controller = module.get<FacebookGroupController>(FacebookGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
