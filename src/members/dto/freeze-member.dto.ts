import { IsBoolean } from "class-validator";

export class FreezeMemberDto {
	@IsBoolean()
	isFrozen: boolean;
}
