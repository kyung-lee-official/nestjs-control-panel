import { z } from "zod";

export const freezeMemberSchema = z.object({
	isFrozen: z.boolean(),
});

export type FreezeMemberDto = z.infer<typeof freezeMemberSchema>;
