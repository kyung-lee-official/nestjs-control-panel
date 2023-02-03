import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateUserEmailDto {
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: "password is too weak"
	})
	password?: string;
}
