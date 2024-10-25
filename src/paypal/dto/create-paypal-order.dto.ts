import { z } from "zod";

export const createPaypalOrderSchema = z.object({
	intent: z.literal("CAPTURE"),
	productId: z.number(),
});

export type CreatePaypalOrderDto = z.infer<typeof createPaypalOrderSchema>;
