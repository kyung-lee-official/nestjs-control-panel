import { z } from "zod";

export const createRoleSchema = z.object({
	id: z.string().regex(/^[a-z0-9\._-]+$/),
	name: z.string().min(3).max(32),
	superRoleId: z.string({ required_error: "superRoleId is required" }),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
