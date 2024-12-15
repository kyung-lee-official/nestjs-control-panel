import { z } from "zod";

export const createStatDtoSchema = z.object({
	ownerId: z.string(),
	month: z.string().datetime(),
	statSections: z.array(
		z.object({
			weight: z.number().int().min(0).max(100),
			title: z.string(),
			description: z.string().optional(),
		})
	),
});

export type CreateStatDto = z.infer<typeof createStatDtoSchema>;
