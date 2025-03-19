import { z } from "zod";

export const updateMemberProfileSchema = z.object({
	name: z.string(),
});

export type UpdateMemberProfileDto = z.infer<typeof updateMemberProfileSchema>;
