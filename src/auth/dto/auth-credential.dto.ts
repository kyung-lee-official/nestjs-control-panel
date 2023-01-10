import { IsEmail, IsString } from "class-validator";

export class AuthCredentialsDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}
