import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { SeedServerDto } from "./dto/seed-server.dto";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcrypt";
import { MemberServerSetting } from "@prisma/client";
import { UpdateServerSettingsDto } from "./dto/update-server-settings.dto";
import { REQUEST } from "@nestjs/core";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";
import { JwtService } from "@nestjs/jwt";
import { ResendService } from "src/resend/resend.service";

@Injectable({ scope: Scope.REQUEST })
export class ServerService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService,
		private readonly resendService: ResendService
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
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

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

		/* send verification email */
		const payload = { email };
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_JWT_SECRET,
			expiresIn: "1d",
		});
		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Verify your email 📧</h1>
				<p>Please verify your email by clicking on the following link:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;
		const html = htmlTemplate(
			`${process.env.FRONTEND_HOST}/sign-up/email-verification?token=${token}`
		);

		await this.resendService.sendEmail(
			email,
			"Please verify your email address 📧",
			html
		);

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
