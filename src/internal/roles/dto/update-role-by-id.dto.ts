import { z } from "zod";

export const updateRoleByIdSchema = z.object({
	name: z.string().optional(),
	superRoleId: z.string().optional(),
	ids: z.array(z.string().uuid()),
});

export type UpdateRoleByIdDto = z.infer<typeof updateRoleByIdSchema>;
