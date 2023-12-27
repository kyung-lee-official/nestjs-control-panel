import { IsUUID } from "class-validator";

export class TransferMemberGroupOwnershipDto {
	@IsUUID("all")
	ownerId: string;
}
