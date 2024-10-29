import { z } from "zod";

export class FindMembersByIds {
	ids: string[];
	constructor(ids: string[]) {
		this.ids = ids;
	}
}

export const findMembersByIdsSchema = z.object({
	ids: z.array(z.string().uuid()),
});

export type FindMembersByIdsDto = z.infer<typeof findMembersByIdsSchema>;
