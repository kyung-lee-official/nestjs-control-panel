import { z } from "zod";

export const findMemberRolesByIdsSchema = z.object({
	roleIds: z.array(z.string()),
});

export type FindMemberRolesByIdsDto = z.infer<
	typeof findMemberRolesByIdsSchema
>;
