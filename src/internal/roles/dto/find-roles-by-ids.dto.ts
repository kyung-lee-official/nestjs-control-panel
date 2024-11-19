import { z } from "zod";

export const findRolesByIdsSchema = z.object({
	roleIds: z.array(z.string()),
});

export type FindRolesByIdsDto = z.infer<typeof findRolesByIdsSchema>;
