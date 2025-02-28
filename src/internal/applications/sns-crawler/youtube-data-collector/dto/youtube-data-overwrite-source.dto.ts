import { z } from "zod";

export const youtubeDataOverwriteSourceSchema = z.array(
	z.object({
		keyword: z.string(),
	})
);

export type YoutubeDataOverwriteSourceDto = z.infer<
	typeof youtubeDataOverwriteSourceSchema
>;
