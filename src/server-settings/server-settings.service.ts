import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateServerSettingDto } from "./dto/create-server-setting.dto";
import { UpdateServerSettingDto } from "./dto/update-server-setting.dto";
import { ServerSetting } from "./entities/server-setting.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ServerSettingsService {
	constructor(
		@InjectRepository(ServerSetting)
		private settingsRepository: Repository<ServerSetting>
	) {}

	/**
	 * !!! Danger, test only !!!
	 * Create a new server setting
	 * @param createServerSettingDto
	 * @returns server settings
	 */
	async create(
		createServerSettingDto: CreateServerSettingDto
	): Promise<ServerSetting> {
		const serverSetting = this.settingsRepository.create(
			createServerSettingDto
		);
		await this.settingsRepository.save(serverSetting);
		return serverSetting;
	}

	async isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
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

	async findAll(): Promise<ServerSetting> {
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
		updateServerSettingDto: UpdateServerSettingDto
	): Promise<ServerSetting> {
		const { allowPublicSignUp, allowGoogleSignIn } = updateServerSettingDto;
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
