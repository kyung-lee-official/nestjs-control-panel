import { z } from "zod";

const findRoleByIdSchema = z.object({
	roleId: z.string(),
});

export type FindRoleByIdDto = z.infer<typeof findRoleByIdSchema>;
