import { IsArray, IsNumber, IsOptional } from "class-validator";

export class UpdateUserGroupsDto {
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	groupIds?: number[];
}
