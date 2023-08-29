import { IsString, MinLength } from "class-validator";

/**
 * @deprecated use default group name "New Group"
 */
export class CreateGroupDto {
	@IsString()
	@MinLength(1)
	name: string;
}
