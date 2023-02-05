import { IsArray, IsUUID } from "class-validator";

export class FindUsersByIdsDto {
	@IsArray()
	@IsUUID("all", { each: true })
	ids: string[];
}
