import { z } from "zod";

export const createMemberSchema = z
	.object({
		email: z.string().email(),
		nickname: z.string(),
		password: z
			.string()
			.min(8)
			.max(32)
			.refine(
				(value) => {
					const passwordRegex =
						/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
					return passwordRegex.test(value);
				},
				{ message: "password is too weak" }
			),
	})
	.required();

export type CreateMemberDto = z.infer<typeof createMemberSchema>;
