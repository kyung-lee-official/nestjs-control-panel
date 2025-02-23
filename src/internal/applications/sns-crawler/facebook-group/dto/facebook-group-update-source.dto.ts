import { z } from "zod";

export const updateSourceSchema = z.object({
	groupAddress: z
		.string()
		.url()
		.regex(/facebook.com\/groups\/[a-zA-Z0-9\.]+$/g),
	groupName: z.string(),
});

export type FacebookGroupUpdateSourceDto = z.infer<typeof updateSourceSchema>;
