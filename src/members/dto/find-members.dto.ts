import { IsEmail, IsOptional, IsString } from "class-validator";

export class FindMembersDto {
	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	nickname?: string;
}
