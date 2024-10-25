import { z } from "zod";

/**
 * @deprecated use default role name "New Role"
 */
export const createMemberRoleSchema = z.object({
	name: z.string().min(3).max(32),
});
