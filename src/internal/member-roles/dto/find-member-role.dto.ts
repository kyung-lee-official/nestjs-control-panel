import { z } from "zod";

const findMemberRoleSchema = z.object({
	roleIds: z.array(z.number().int()),
});

export type FindMemberRoleDto = z.infer<typeof findMemberRoleSchema>;
