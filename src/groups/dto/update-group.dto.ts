import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateGroupDto {
	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsUUID("all")
	ownerId: string;

	@IsOptional()
	@IsArray()
	@IsUUID("all", { each: true })
	userIds: string[];
}
