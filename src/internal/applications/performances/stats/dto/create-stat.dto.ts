import { z } from "zod";

export const createStatDtoSchema = z.object({
	ownerId: z.string(),
});

export type CreateStatDto = z.infer<typeof createStatDtoSchema>;
