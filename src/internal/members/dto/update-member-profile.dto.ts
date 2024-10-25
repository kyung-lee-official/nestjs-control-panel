import { z } from "zod";

const updateMemberProfileSchema = z.object({
	nickname: z.string(),
});

export type UpdateMemberProfileDto = z.infer<typeof updateMemberProfileSchema>;
