import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class UpdateMemberRolesDto {
	@IsNotEmpty()
	@IsArray()
	@IsNumber({}, { each: true })
	newRoleIds: number[];
}
