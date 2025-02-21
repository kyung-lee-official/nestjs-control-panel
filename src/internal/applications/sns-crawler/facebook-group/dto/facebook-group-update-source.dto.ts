import { z } from "zod";

export const updateSourceSchema = z.object({
	groupAddress: z.string().url(),
	groupName: z.string(),
});

export type FacebookGroupUpdateSourceDto = z.infer<typeof updateSourceSchema>;
