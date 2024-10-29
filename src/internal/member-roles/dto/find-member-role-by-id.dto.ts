import { z } from "zod";

const findMemberRoleByIdSchema = z.object({
	roleIds: z.string(),
});

export type FindMemberRoleByIdDto = z.infer<typeof findMemberRoleByIdSchema>;
