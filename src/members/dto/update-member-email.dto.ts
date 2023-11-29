import { IsEmail } from "class-validator";

export class UpdateMemberEmailDto {
	@IsEmail()
	email: string;
}
