import { Test } from "@nestjs/testing";
import { MemberAuthService } from "./member-auth.service";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import { PrismaService } from "../prisma/prisma.service";

describe("MemberAuthService", () => {
	let authService: MemberAuthService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				MemberAuthService,
				PrismaService,
				JwtService,
				{
					provide: MailerService,
					useValue: () => ({
						sendMail: jest.fn(),
					}),
				},
			],
		}).compile();

		authService = module.get<MemberAuthService>(MemberAuthService);
	});

	it("can create an instance of auth service", async () => {
		expect(authService).toBeDefined();
	});
});
