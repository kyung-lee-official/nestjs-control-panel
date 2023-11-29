import { IsArray, IsNumber, IsOptional } from "class-validator";

export class UpdateMemberRolesDto {
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	roleIds?: number[];
}
