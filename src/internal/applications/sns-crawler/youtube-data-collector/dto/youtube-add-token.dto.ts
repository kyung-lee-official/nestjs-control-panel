import { z } from "zod";

export const youtubeAddTokenSchema = z.object({
	token: z.string(),
});

export type YouTubeAddTokenDto = z.infer<typeof youtubeAddTokenSchema>;
