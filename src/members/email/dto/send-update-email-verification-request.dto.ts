import { z } from "zod";

export const sendUpdateEmailVerificationRequestSchema = z
	.object({
		newEmail: z.string().email(),
	})
	.required();

export type SendUpdateEmailVerificationRequestDto = z.infer<
	typeof sendUpdateEmailVerificationRequestSchema
>;
