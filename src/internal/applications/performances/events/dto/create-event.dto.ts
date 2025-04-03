import { z } from "zod";

export const createEventDtoSchema = z.object({
	templateId: z.number().optional(),
	sectionId: z.number(),
	score: z.number(),
	/* amount can only be added after the event is created, default is 1 */
	amount: z.number().optional(),
	description: z.string().min(1, "description is required"),
	/* attachments can only be added after the event is created */
	// attachments: z.array(z.string()),
});

export type CreateEventDto = z.infer<typeof createEventDtoSchema>;
