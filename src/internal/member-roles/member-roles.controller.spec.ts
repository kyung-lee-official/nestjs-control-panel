import { Test, TestingModule } from '@nestjs/testing';
import { MemberRolesController } from './member-roles.controller';
import { MemberRolesService } from './member-roles.service';

describe('MemberRolesController', () => {
	let controller: MemberRolesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MemberRolesController],
			providers: [MemberRolesService],
		}).compile();

		controller = module.get<MemberRolesController>(MemberRolesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
