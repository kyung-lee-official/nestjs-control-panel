import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberServerSettingDto } from './create-member-server-setting.dto';
import { IsBoolean } from "class-validator";

export class UpdateMemberServerSettingDto extends PartialType(CreateMemberServerSettingDto) {
	@IsBoolean()
	allowPublicSignUp: boolean;

	@IsBoolean()
	allowGoogleSignIn: boolean;
}
