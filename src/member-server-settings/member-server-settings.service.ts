import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateMemberServerSettingDto } from "./dto/create-member-server-setting.dto";
import { UpdateMemberServerSettingDto } from "./dto/update-member-server-setting.dto";
import { PrismaService } from "../prisma/prisma.service";
import { MemberServerSetting } from "@prisma/client";

@Injectable()
export class MemberServerSettingsService {
	constructor(private readonly prisonService: PrismaService) {}

	/**
	 * !!! Danger, test only !!!
	 * Create a new server setting
	 * @param createMemberServerSettingDto
	 * @returns server settings
	 */
	async create(
		createMemberServerSettingDto: CreateMemberServerSettingDto
	): Promise<MemberServerSetting> {
		const serverSetting =
			await this.prisonService.memberServerSetting.create({
				data: createMemberServerSettingDto,
			});
		return serverSetting;
	}

	async isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
		const dbSettingCounts =
			await this.prisonService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prisonService.memberServerSetting.findMany();
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
			await this.prisonService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prisonService.memberServerSetting.findMany();
		const setting = dbSettings[0];
		if (setting.allowGoogleSignIn) {
			return { isGoogleSignInAvailable: true };
		} else {
			return { isGoogleSignInAvailable: false };
		}
	}

	async findAll(): Promise<MemberServerSetting> {
		const dbSettingCounts =
			await this.prisonService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const dbSettings =
			await this.prisonService.memberServerSetting.findMany();
		return dbSettings[0];
	}

	// findOne(id: number) {
	// 	return `This action returns a #${id} serverSetting`;
	// }

	async update(
		updateMemberServerSettingDto: UpdateMemberServerSettingDto
	): Promise<MemberServerSetting> {
		const dbSettingCounts =
			await this.prisonService.memberServerSetting.count();
		if (dbSettingCounts !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const settings =
			await this.prisonService.memberServerSetting.findFirst();
		const updatedSettings =
			await this.prisonService.memberServerSetting.update({
				where: { id: settings.id },
				data: updateMemberServerSettingDto,
			});
		return updatedSettings;
	}

	// remove(id: number) {
	// 	return `This action removes a #${id} serverSetting`;
	// }
}
