import { z } from "zod";

export const completePaypalOrderSchema = z.object({
	orderId: z.string(),
});

export type CompletePaypalOrderDto = z.infer<
	typeof completePaypalOrderSchema
>;
