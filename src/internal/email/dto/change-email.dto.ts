import { z } from "zod";

export const changeEmailSchema = z
	.object({
		newEmail: z.string().email().toLowerCase(),
	})
	.required();

export type ChangeEmailDto = z.infer<typeof changeEmailSchema>;
