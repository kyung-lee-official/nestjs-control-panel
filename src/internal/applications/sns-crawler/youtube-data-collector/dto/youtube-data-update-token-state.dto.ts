import { z } from "zod";

export const youtubeDataUpdateTokenStateSchema = z.object({
	recentlyUsedToken: z.string().optional(),
	oldToken: z.string().optional(),
});

export type YouTubeDataUpdateTokenStateDto = z.infer<
	typeof youtubeDataUpdateTokenStateSchema
>;
