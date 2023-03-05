import { IsNumber, IsString } from "class-validator";

export class CreatePaypalOrderDto {
	@IsString()
	intent: "CAPTURE";

	@IsNumber()
	productId: number;
}
