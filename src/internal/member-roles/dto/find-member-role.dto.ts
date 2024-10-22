import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt } from "class-validator";

export class FindMemberRoleDto {
	@ApiProperty()
	@IsInt({ each: true })
	@IsArray()
	roleIds: number[];
}
