import { z } from "zod";

export const updateMemberPasswordSchema = z
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

export type UpdateMemberPasswordDto = z.infer<
	typeof updateMemberPasswordSchema
>;
