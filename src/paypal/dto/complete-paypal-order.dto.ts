import { IsString } from "class-validator";

export class CompletePaypalOrderDto {
	@IsString()
	orderId: string;
}
