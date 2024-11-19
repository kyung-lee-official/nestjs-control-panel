import { z } from "zod";

/**
 * @deprecated use default role name "New Role"
 */
export const createRoleSchema = z.object({
	name: z.string().min(3).max(32),
});
