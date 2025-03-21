import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { SeedServerDto } from "./dto/seed-server.dto";
import { EmailService } from "../email/email.service";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcrypt";
import { MemberServerSetting } from "@prisma/client";
import { UpdateServerSettingsDto } from "./dto/update-server-settings.dto";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { REQUEST } from "@nestjs/core";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable({ scope: Scope.REQUEST })
export class ServerService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService,
		private readonly emailService: EmailService,
		private readonly utilsService: UtilsService
	) {}

	async permissions() {
		const { requester } = this.request;

		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*"];
		const resource = {
			kind: "internal:server-settings",
			id: "*",
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		return { ...decision };
	}

	async seed(seedServerDto: SeedServerDto) {
		const memberCount = await this.prismaService.member.count();
		if (memberCount > 0) {
			throw new BadRequestException("Server already seeded");
		}
		await this.prismaService.memberServerSetting.create({
			data: {
				allowPublicSignUp: false,
				allowGoogleSignIn: false,
			},
		});
		let { email, password, name } = seedServerDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		/* create 'admin' and 'default' roles */
		const adminRole = await this.prismaService.memberRole.create({
			data: {
				id: "admin",
				name: "Admin",
				subRoles: {
					create: [
						{
							id: "default",
							name: "Default",
						},
					],
				},
			},
		});

		/* add member to 'admin' and 'default' roles */
		const member = await this.prismaService.member.create({
			data: {
				email,
				password: hashedPassword,
				name,
				isVerified: false,
				memberRoles: {
					connect: [
						{
							id: "admin",
						},
						{
							id: "default",
						},
					],
				},
			},
			include: {
				memberRoles: {
					include: {
						subRoles: true,
					},
				},
			},
		});

		await this.emailService.sendVerificationEmail(email);
		return member;
	}

	async isSeeded(): Promise<{ isSeeded: boolean }> {
		const memberCount = await this.prismaService.member.count();
		if (memberCount > 0) {
			return { isSeeded: true };
		} else {
			return { isSeeded: false };
		}
	}

	async getServerSettings() {
		const dbSettingCounts =
			await this.prismaService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prismaService.memberServerSetting.findFirst();
		return dbSettings;
	}

	async updateServerSettings(
		updateMemberServerSettingDto: UpdateServerSettingsDto
	): Promise<MemberServerSetting> {
		const dbSettingCounts =
			await this.prismaService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const settings =
			await this.prismaService.memberServerSetting.findFirst();
		if (!settings) {
			throw new NotFoundException("Server setting not found");
		}
		const updatedSettings =
			await this.prismaService.memberServerSetting.update({
				where: { id: settings.id },
				data: updateMemberServerSettingDto,
			});
		return updatedSettings;
	}

	async isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
		const dbSettingCounts =
			await this.prismaService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prismaService.memberServerSetting.findMany();
		const setting = dbSettings[0];
		if (setting.allowPublicSignUp) {
			return { isSignUpAvailable: true };
		} else {
			return { isSignUpAvailable: false };
		}
	}

	async isGoogleSignInAvailable(): Promise<{
		isGoogleSignInAvailable: boolean;
	}> {
		const dbSettingCounts =
			await this.prismaService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prismaService.memberServerSetting.findMany();
		const setting = dbSettings[0];
		if (setting.allowGoogleSignIn) {
			return { isGoogleSignInAvailable: true };
		} else {
			return { isGoogleSignInAvailable: false };
		}
	}

	// update(id: number, updateServerDto: UpdateServerDto) {
	// 	return `This action updates a #${id} server`;
	// }
}
