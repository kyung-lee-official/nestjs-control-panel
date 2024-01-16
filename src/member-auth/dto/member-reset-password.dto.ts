import { ApiProperty } from "@nestjs/swagger";
import {
	IsDefined,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from "class-validator";

export class MemberResetPasswordDto {
	@ApiProperty()
	@IsDefined()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: "password is too weak",
	})
	password: string;

	@ApiProperty()
	@IsDefined()
	@IsString()
	resetPasswordToken: string;
}
