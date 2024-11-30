import { z } from "zod";

export const createEventTemplateDtoSchema = z.object({
	score: z.number().int().min(0).max(100),
	description: z.string(),
	memberRoleId: z.string(),
});

export type CreateEventTemplateDto = z.infer<
	typeof createEventTemplateDtoSchema
>;
