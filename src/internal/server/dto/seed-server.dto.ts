import { z } from "zod";

export const seedServerSchema = z
	.object({
		email: z.string().email().toLowerCase(),
		name: z.string().min(1).max(32),
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

export type SeedServerDto = z.infer<typeof seedServerSchema>;
