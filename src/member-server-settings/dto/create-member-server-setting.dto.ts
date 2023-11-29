import { IsBoolean } from "class-validator";

export class CreateMemberServerSettingDto {
	@IsBoolean()
	allowPublicSignUp: boolean;

	@IsBoolean()
	allowGoogleSignIn: boolean;
}
