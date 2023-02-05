import { IsArray, IsEnum, IsOptional } from "class-validator";
import { Permissions } from "src/permissions/permissions.enum";

export class UpdateRoleDto {
	@IsOptional()
	@IsArray()
	@IsEnum(Permissions, { each: true })
	permissions: Permissions[];

	@IsOptional()
	userIds: string[];
}
