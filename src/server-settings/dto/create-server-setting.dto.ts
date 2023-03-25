import { IsBoolean } from "class-validator";

export class CreateServerSettingDto {
	@IsBoolean()
	allowPublicSignUp: boolean;

	@IsBoolean()
	allowGoogleSignUp: boolean;
}
