import { z } from "zod";

export const updateTaskKeywordSearchesByIdSchema = z.object({
	id: z.number().int(),
	searches: z.array(
		z.object({
			id: z.string() /* videoId */,
			publishedAt: z.string().datetime(),
			channelId: z.string(),
		})
	),
});

export type UpdateTaskKeywordSearchesByIdDto = z.infer<
	typeof updateTaskKeywordSearchesByIdSchema
>;
