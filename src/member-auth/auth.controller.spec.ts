import { Test, TestingModule } from "@nestjs/testing";
import { MemberAuthController } from "./member-auth.controller";
import { MemberAuthService } from "./member-auth.service";
import { PrismaService } from "../prisma/prisma.service";

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
				PrismaService,
			],
		}).compile();

		controller = module.get<MemberAuthController>(MemberAuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
