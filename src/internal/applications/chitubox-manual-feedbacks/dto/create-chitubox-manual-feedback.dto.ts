import { z } from "zod";

export enum ChituboxManualFeedbackPayload {
	USEFUL = "USEFUL",
	USELESS = "USELESS",
}

export const createChituboxManualFeedbackSchema = z.object({
	pageId: z.string(),
	url: z.string().refine(
		(value) => {
			const urlRegex = /manual\.chitubox\.com/;
			return urlRegex.test(value);
		},
		{ message: "Illegal URL" }
	),
	payload: z.nativeEnum(ChituboxManualFeedbackPayload),
});

export type CreateChituboxManualFeedbackDto = z.infer<
	typeof createChituboxManualFeedbackSchema
>;
