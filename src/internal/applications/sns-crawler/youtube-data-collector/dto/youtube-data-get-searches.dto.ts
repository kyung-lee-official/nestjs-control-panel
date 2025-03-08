import { z } from "zod";

export const youtubeDataGetSearchesSchema = z.object({
	taskId: z.number().int(),
	keyword: z.string(),
});

export type YouTubeDataGetSearchesDto = z.infer<
	typeof youtubeDataGetSearchesSchema
>;
