import { Test, TestingModule } from '@nestjs/testing';
import { ServerSettingsController } from './member-server-settings.controller';
import { MemberServerSettingsService } from './member-server-settings.service';

describe('ServerSettingsController', () => {
	let controller: ServerSettingsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ServerSettingsController],
			providers: [MemberServerSettingsService],
		}).compile();

		controller = module.get<ServerSettingsController>(ServerSettingsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
