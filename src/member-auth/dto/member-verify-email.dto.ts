import { IsDefined, IsString } from "class-validator";

export class MemberVerifyEmailDto {
	@IsDefined()
	@IsString()
	verificationToken: string;
}
