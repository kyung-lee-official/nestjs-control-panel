import { IsArray, IsUUID } from "class-validator";

export class FindMembersByIdsDto {
	@IsArray()
	@IsUUID("all", { each: true })
	ids: string[];
}
