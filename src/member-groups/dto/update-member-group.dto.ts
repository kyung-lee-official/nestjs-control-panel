import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateMemberGroupDto {
	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsArray()
	@IsUUID("all", { each: true })
	memberIds: string[];
}
