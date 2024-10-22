import { z } from "zod";

export const verifyNewEmailSchema = z
	.object({
		verificationToken: z.string(),
	})
	.required();

export type VerifyNewEmailDto = z.infer<typeof verifyNewEmailSchema>;
