import { Test, TestingModule } from '@nestjs/testing';
import { MemberServerSettingsService } from './member-server-settings.service';

describe('MemberServerSettingsService ', () => {
	let service: MemberServerSettingsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MemberServerSettingsService],
		}).compile();

		service = module.get<MemberServerSettingsService>(MemberServerSettingsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
