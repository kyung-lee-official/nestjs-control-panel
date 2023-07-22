import { PartialType } from '@nestjs/mapped-types';
import { CreateServerSettingDto } from './create-server-setting.dto';
import { IsBoolean } from "class-validator";

export class UpdateServerSettingDto extends PartialType(CreateServerSettingDto) {
	@IsBoolean()
	allowPublicSignUp: boolean;

	@IsBoolean()
	allowGoogleSignIn: boolean;
}
