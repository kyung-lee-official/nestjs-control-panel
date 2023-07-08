import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Role } from "../roles/entities/role.entity";
import { Group } from "../groups/entities/group.entity";
import { ServerSetting } from "../server-settings/entities/server-setting.entity";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";

describe("AuthService", () => {
	let authService: AuthService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: () => ({
						create: jest.fn(),
						createQueryBuilder: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						delete: jest.fn(),
					}),
				},
				{
					provide: getRepositoryToken(Role),
					useValue: () => ({
						create: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						delete: jest.fn(),
					}),
				},
				{
					provide: getRepositoryToken(Group),
					useValue: () => ({
						create: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						delete: jest.fn(),
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
				JwtService,
				{
					provide: MailerService,
					useValue: () => ({
						sendMail: jest.fn(),
					}),
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
	});

	it("can create an instance of auth service", async () => {
		expect(authService).toBeDefined();
	});
});
