import { z } from "zod";

export const youtubeDataOverwriteSourceSchema = z.array(
	z.object({
		excelRow: z.number().int(),
		keyword: z.string(),
	})
);

export type YoutubeDataOverwriteSourceDto = z.infer<
	typeof youtubeDataOverwriteSourceSchema
>;
