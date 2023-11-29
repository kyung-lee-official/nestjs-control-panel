import { Test } from "@nestjs/testing";
import { MemberAuthService } from "./member-auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Member } from "../members/entities/member.entity";
import { MemberRole } from "../member-roles/entities/member-role.entity";
import { MemberGroup } from "../member-groups/entities/member-group.entity";
import { MemberServerSetting } from "../member-server-settings/entities/member-server-setting.entity";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";

describe("MemberAuthService", () => {
	let authService: MemberAuthService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				MemberAuthService,
				{
					provide: getRepositoryToken(Member),
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
					provide: getRepositoryToken(MemberRole),
					useValue: () => ({
						create: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						delete: jest.fn(),
					}),
				},
				{
					provide: getRepositoryToken(MemberGroup),
					useValue: () => ({
						create: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						delete: jest.fn(),
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
