import { z } from "zod";

export const createEventTemplateDtoSchema = z.object({
	score: z.number(),
	description: z.string().min(1),
	memberRoleId: z.string(),
});

export type CreateEventTemplateDto = z.infer<
	typeof createEventTemplateDtoSchema
>;
