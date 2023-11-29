import { IsArray, IsNumber, IsOptional } from "class-validator";

export class UpdateMemberGroupsDto {
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	groupIds?: number[];
}
