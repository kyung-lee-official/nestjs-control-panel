import { z } from "zod";

export const updateMemberRoleByIdSchema = z.object({
	name: z.string().optional(),
	superRoleId: z.string().optional(),
	memberIds: z.array(z.string().uuid()),
});

export type UpdateMemberRoleByIdDto = z.infer<
	typeof updateMemberRoleByIdSchema
>;
