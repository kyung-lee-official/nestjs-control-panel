import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ServerSetting } from "../server-settings/entities/server-setting.entity";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
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
					provide: getRepositoryToken(ServerSetting),
					useValue: () => ({
						create: jest.fn(),
						createQueryBuilder: jest.fn(),
						find: jest.fn(),
						save: jest.fn(),
					}),
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
