import { z } from "zod";

export const searchStatDtoSchema = z.object({
	ownerId: z.string(),
	year: z.string().datetime(),
});

export type SearchStatDto = z.infer<typeof searchStatDtoSchema>;
