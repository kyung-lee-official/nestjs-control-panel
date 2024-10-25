import { z } from "zod";

export const updateMemberEmailSchema = z
	.object({
		email: z.string().email().toLowerCase(),
	})
	.required();

export type UpdateMemberEmailDto = z.infer<typeof updateMemberEmailSchema>;
