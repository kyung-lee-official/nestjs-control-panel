import { IsDefined, IsString } from "class-validator";

export class VerifyEmailDto {
	@IsDefined()
	@IsString()
	verificationToken: string;
}
