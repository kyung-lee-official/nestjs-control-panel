import { z } from "zod";

export const searchStatDtoSchema = z.object({
	ownerId: z.string(),
	year: z.string().date(),
});

export type SearchStatDto = z.infer<typeof searchStatDtoSchema>;
