import { IsDefined, IsEmail } from "class-validator";

export class MemberUpdateEmailRequestDto {
	@IsDefined()
	@IsEmail()
	newEmail: string;
}
