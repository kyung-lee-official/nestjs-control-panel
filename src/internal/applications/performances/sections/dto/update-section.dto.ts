import { z } from "zod";

export const updateSectionDtoSchema = z.object({
	sectionId: z.number().int(),
	weight: z.number().int().min(0).max(100),
	title: z.string(),
	description: z.string(),
});

export type UpdateSectionDto = z.infer<typeof updateSectionDtoSchema>;
