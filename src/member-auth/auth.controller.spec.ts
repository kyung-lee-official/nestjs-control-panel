import { Test, TestingModule } from "@nestjs/testing";
import { MemberAuthController } from "./member-auth.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MemberServerSetting } from "../member-server-settings/entities/member-server-setting.entity";
import { MemberAuthService } from "./member-auth.service";

describe("MemberAuthController", () => {
	let controller: MemberAuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MemberAuthController],
			providers: [
				{
					provide: MemberAuthService,
					useValue: () => ({
						isSeeded: jest.fn(),
						seed: jest.fn(),
						signUp: jest.fn(),
						signIn: jest.fn(),
						isSignedIn: jest.fn(),
						googleSignIn: jest.fn(),
						sendVerificationEmail: jest.fn(),
						testSendVerificationEmail: jest.fn(),
						verifyEmail: jest.fn(),
					}),
				},
				{
					provide: getRepositoryToken(MemberServerSetting),
					useValue: () => ({
						create: jest.fn(),
						createQueryBuilder: jest.fn(),
						find: jest.fn(),
						save: jest.fn(),
					}),
				},
			],
		}).compile();

		controller = module.get<MemberAuthController>(MemberAuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
