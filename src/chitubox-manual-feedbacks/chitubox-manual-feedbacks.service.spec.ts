import { Test, TestingModule } from '@nestjs/testing';
import { ChituboxManualFeedbacksService } from "./chitubox-manual-feedbacks.service";

describe('ChituboxManualFeedbacksService', () => {
	let service: ChituboxManualFeedbacksService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ChituboxManualFeedbacksService],
		}).compile();

		service = module.get<ChituboxManualFeedbacksService>(ChituboxManualFeedbacksService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
