import { IsBoolean } from "class-validator";

export class FreezeUserDto {
	@IsBoolean()
	isFrozen: boolean;
}
