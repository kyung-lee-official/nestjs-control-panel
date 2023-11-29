import { IsEmail, IsString } from "class-validator";

export class MemberAuthCredentialsDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}
