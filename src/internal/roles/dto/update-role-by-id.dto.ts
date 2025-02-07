import { z } from "zod";

export const updateRoleByIdSchema = z.object({
	id: z.string(),
	name: z.string(),
	superRoleId: z.string().optional(),
	memberIds: z.array(z.string().uuid()),
});

export type UpdateRoleByIdDto = z.infer<typeof updateRoleByIdSchema>;
