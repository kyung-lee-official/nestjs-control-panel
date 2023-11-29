import { IsString, MinLength } from "class-validator";

/**
 * @deprecated use default group name "New Group"
 */
export class CreateMemberGroupDto {
	@IsString()
	@MinLength(1)
	name: string;
}
