import { IsOptional, IsString } from "class-validator";

export class UpdateMemberDto {
	@IsOptional()
	@IsString()
	nickname?: string;
}
