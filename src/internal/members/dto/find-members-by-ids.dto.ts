import { z } from "zod";

export const findMembersByIdsSchema = z.object({
	ids: z.array(z.string().uuid()),
});

export type FindMembersByIdsDto = z.infer<typeof findMembersByIdsSchema>;
