import { z } from "zod";

export const youtubeDataSearchSchema = z
	.object({
		taskId: z.number(),
		start: z.string().datetime(),
		end: z.string().datetime(),
		targetResultCount: z.number().int().min(1),
	})
	.refine((data) => data.start < data.end, {
		message: "start date must be before end date",
	});

export type YouTubeDataSearchDto = z.infer<typeof youtubeDataSearchSchema>;
