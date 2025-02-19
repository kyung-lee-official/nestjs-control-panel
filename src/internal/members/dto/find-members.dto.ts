import { z } from "zod";

export const findMembersSchema = z.object({
	email: z.string().email().toLowerCase().optional(),
	name: z.string().optional(),
});

export type FindMembersDto = z.infer<typeof findMembersSchema>;
