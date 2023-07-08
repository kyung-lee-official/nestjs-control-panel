import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Permissions } from "../../permissions/permissions.enum";

export class UpdateRoleDto {
	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsArray()
	@IsEnum(Permissions, { each: true })
	permissions: Permissions[];

	@IsOptional()
	@IsUUID("all", { each: true })
	userIds: string[];
}
