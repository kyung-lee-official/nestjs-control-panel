import { z } from "zod";

export const findMembersSchema = z
	.object({
		email: z.string().email().toLowerCase(),
		name: z.string(),
	})
	.required();

export type FindMembersDto = z.infer<typeof findMembersSchema>;
