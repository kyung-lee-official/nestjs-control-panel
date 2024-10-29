import { z } from "zod";

export const updateMyPasswordSchema = z
	.object({
		oldPassword: z.string(),
		newPassword: z
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

export type UpdateMyPasswordDto = z.infer<
	typeof updateMyPasswordSchema
>;
