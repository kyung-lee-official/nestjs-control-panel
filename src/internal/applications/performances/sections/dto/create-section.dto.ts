import { z } from "zod";

export const createSectionDtoSchema = z.object({
	statId: z.number().int(),
	weight: z.number().int().min(0).max(100),
	memberRoleId: z.string(),
	title: z.string(),
	description: z.string(),
});

export type CreateSectionDto = z.infer<typeof createSectionDtoSchema>;
