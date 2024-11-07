import { z } from "zod";

const updateMemberProfileSchema = z.object({
	name: z.string(),
});

export type UpdateMemberProfileDto = z.infer<typeof updateMemberProfileSchema>;
