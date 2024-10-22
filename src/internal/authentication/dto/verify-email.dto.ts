import { z } from "zod";

export const verifyEmailSchema = z
	.object({
		verificationToken: z.string(),
	})
	.required();

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
