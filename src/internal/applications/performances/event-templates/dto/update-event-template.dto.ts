import { z } from "zod";

export const updateEventTemplateDtoSchema = z.object({
	score: z.number().int().min(0).max(100),
	description: z.string(),
	memberRoleId: z.string(),
});

export type UpdateEventTemplateDto = z.infer<
	typeof updateEventTemplateDtoSchema
>;
