import { z } from "zod";

export const createEventDtoSchema = z.object({
	templateId: z.number().optional(),
	sectionId: z.number(),
	score: z.number(),
	amount: z.number(),
	description: z.string(),
	attachments: z.array(z.string()),
});

export type CreateEventDto = z.infer<typeof createEventDtoSchema>;
