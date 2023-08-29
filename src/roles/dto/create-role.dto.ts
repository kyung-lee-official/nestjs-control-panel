import { IsString, MinLength } from "class-validator";

/**
 * @deprecated use default role name "New Role"
 */
export class CreateRoleDto {
	@IsString()
	@MinLength(1)
	name: string;
}
