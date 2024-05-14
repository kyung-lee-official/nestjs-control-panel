import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateMemberGroupDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	name: string;

	@ApiProperty()
	@IsArray()
	@IsOptional()
	@IsUUID("all", { each: true })
	memberIds: string[];
}
