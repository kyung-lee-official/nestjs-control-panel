import { z } from "zod";

export const iso8601DateRangeSchema = z.object({
	startDate: z.string().date().optional(),
	endDate: z.string().date().optional(),
});

export type Iso8601DateRangeDto = z.infer<typeof iso8601DateRangeSchema>;
