import { z } from "zod";

export const createMemberSchema = z.object({
	email: z.string().email(),
	name: z.string(),
});

export type CreateMemberDto = z.infer<typeof createMemberSchema>;
