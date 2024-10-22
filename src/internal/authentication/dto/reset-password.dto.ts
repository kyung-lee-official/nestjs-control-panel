import { z } from "zod";

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8)
			.max(32)
			.refine(
				(value) => {
					const regex =
						/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
					return regex.test(value);
				},
				{ message: "password is too weak" }
			),
		resetPasswordToken: z.string(),
	})
	.required();

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
