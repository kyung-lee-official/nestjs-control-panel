import { IsDefined, IsEmail } from "class-validator";

export class MemberForgetPasswordDto {
	@IsDefined()
	@IsEmail()
	email: string;
}
