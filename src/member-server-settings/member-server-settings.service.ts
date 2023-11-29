import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateMemberServerSettingDto } from "./dto/create-member-server-setting.dto";
import { UpdateMemberServerSettingDto } from "./dto/update-member-server-setting.dto";
import { MemberServerSetting } from "./entities/member-server-setting.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MemberServerSettingsService {
	constructor(
		@InjectRepository(MemberServerSetting)
		private settingsRepository: Repository<MemberServerSetting>
	) { }

	/**
	 * !!! Danger, test only !!!
	 * Create a new server setting
	 * @param createMemberServerSettingDto
	 * @returns server settings
	 */
	async create(
		createMemberServerSettingDto: CreateMemberServerSettingDto
	): Promise<MemberServerSetting> {
		const serverSetting = this.settingsRepository.create(
			createMemberServerSettingDto
		);
		await this.settingsRepository.save(serverSetting);
		return serverSetting;
	}

	async isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean; }> {
		const dbSettings = await this.settingsRepository.find();
		if (dbSettings.length !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
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
		const dbSettings = await this.settingsRepository.find();
		if (dbSettings.length !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const setting = dbSettings[0];
		if (setting.allowGoogleSignIn) {
			return { isGoogleSignInAvailable: true };
		} else {
			return { isGoogleSignInAvailable: false };
		}
	}

	async findAll(): Promise<MemberServerSetting> {
		const settingQb =
			this.settingsRepository.createQueryBuilder("serverSetting");
		settingQb.limit(1);
		const setting = await settingQb.getMany();
		if (setting.length !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		return setting[0];
	}

	// findOne(id: number) {
	// 	return `This action returns a #${id} serverSetting`;
	// }

	async update(
		updateMemberServerSettingDto: UpdateMemberServerSettingDto
	): Promise<MemberServerSetting> {
		const { allowPublicSignUp, allowGoogleSignIn } = updateMemberServerSettingDto;
		const settingQb =
			this.settingsRepository.createQueryBuilder("serverSetting");
		settingQb.limit(1);
		const settings = await settingQb.getMany();
		if (settings.length !== 1) {
			throw new InternalServerErrorException(
				"Server setting number is not 1"
			);
		}
		const setting = settings[0];
		if (allowPublicSignUp !== null && allowPublicSignUp !== undefined) {
			setting.allowPublicSignUp = allowPublicSignUp;
		}
		if (allowGoogleSignIn !== null && allowGoogleSignIn !== undefined) {
			setting.allowGoogleSignIn = allowGoogleSignIn;
		}
		await this.settingsRepository.save(setting);
		return setting;
	}

	// remove(id: number) {
	// 	return `This action removes a #${id} serverSetting`;
	// }
}
