import { Test, TestingModule } from '@nestjs/testing';
import { ChituboxManualFeedbacksService } from './chitubox-manual-feedbacks.service';
import { ChituboxManualFeedbacksController } from "./chitubox-manual-feedbacks.controller";

describe('ChituboxManualFeedbacksController', () => {
	let controller: ChituboxManualFeedbacksController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChituboxManualFeedbacksController],
			providers: [ChituboxManualFeedbacksService],
		}).compile();

		controller = module.get<ChituboxManualFeedbacksController>(ChituboxManualFeedbacksController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
