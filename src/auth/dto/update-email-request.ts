import { IsDefined, IsEmail } from "class-validator";

export class UpdateEmailRequestDto {
	@IsDefined()
	@IsEmail()
	newEmail: string;
}
