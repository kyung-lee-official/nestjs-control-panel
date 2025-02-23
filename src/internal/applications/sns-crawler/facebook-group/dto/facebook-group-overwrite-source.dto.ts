import { z } from "zod";

export const overwriteSourceSchema = z.array(
	z.object({
		groupAddress: z
			.string()
			.url()
			.regex(/facebook.com\/groups\/[a-zA-Z0-9\.]+\/*$/g),
		groupName: z.string(),
	})
);

export type FacebookGroupOverwriteSourceDto = z.infer<
	typeof overwriteSourceSchema
>;
