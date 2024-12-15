import { z } from "zod";

export const updateStatDtoSchema = z.object({
	ownerId: z.string(),
	month: z.string().datetime(),
	statSections: z.array(
		z.object({
			id: z.number().int().optional(),
			tempId: z.string().optional(),
			weight: z.number().int().min(0).max(100),
			title: z.string(),
			description: z.string().optional(),
		})
	),
});

export type UpdateStatDto = z.infer<typeof updateStatDtoSchema>;
