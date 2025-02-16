import { z } from "zod";

export const updateEventDtoSchema = z.object({
	score: z.number().min(0),
	/* amount can only be added after the event is created, default is 1 */
	amount: z.number().min(0).optional(),
	description: z.string(),
	/* attachments can only be added after the event is created */
	// attachments: z.array(z.string()),
});

export type UpdateEventDto = z.infer<typeof updateEventDtoSchema>;
