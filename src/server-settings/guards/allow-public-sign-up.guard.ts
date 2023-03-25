import {
	CanActivate,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
	ServiceUnavailableException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ServerSetting } from '../entities/server-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AllowPublicSignUpGuard implements CanActivate {
	constructor(
		@InjectRepository(ServerSetting)
		private settingsRepository: Repository<ServerSetting>,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const dbSettings = await this.settingsRepository.find();
		if (dbSettings.length !== 1) {
			throw new InternalServerErrorException(
				"Illegitimate, more then 1 server setting was found.",
			);
		}
		const setting = dbSettings[0];
		if (setting.allowPublicSignUp) {
			return true;
		} else {
			return false;
		}
	}
}
