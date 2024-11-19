import { z } from "zod";

const findRoleByIdSchema = z.object({
	roleIds: z.string(),
});

export type FindRoleByIdDto = z.infer<typeof findRoleByIdSchema>;
