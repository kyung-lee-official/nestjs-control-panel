import { z } from "zod";

export const createStatDtoSchema = z.object({
	ownerId: z.string(),
	month: z.string().date(),
	statSections: z.array(
		z.object({
			weight: z.number().int().min(0).max(100),
			memberRoleId: z.string(),
			title: z.string(),
			description: z.string().optional(),
		})
	),
});

export type CreateStatDto = z.infer<typeof createStatDtoSchema>;
