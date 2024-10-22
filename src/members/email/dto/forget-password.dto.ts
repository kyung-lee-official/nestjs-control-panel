import { z } from "zod";

export const forgetPasswordSchema = z
	.object({
		email: z.string().email(),
	})
	.required();

export type ForgetPasswordDto = z.infer<typeof forgetPasswordSchema>;
