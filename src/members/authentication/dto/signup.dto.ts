import { z } from "zod";

export const signUpSchema = z
	.object({
		email: z.string().email().toLowerCase(),
		nickname: z.string().min(1).max(32),
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

export type SignUpDto = z.infer<typeof signUpSchema>;
