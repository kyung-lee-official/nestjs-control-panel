import { z } from "zod";

export class UpdateServerSettings {
	allPublicSignUp: boolean | undefined;
	allowGoogleSignIn: boolean | undefined;

	constructor(dto: UpdateServerSettingsDto) {
		this.allPublicSignUp = dto.allowPublicSignUp;
		this.allowGoogleSignIn = dto.allowGoogleSignIn;
	}
}

export const updateServerSchema = z
	.object({
		allowPublicSignUp: z.boolean(),
		allowGoogleSignIn: z.boolean(),
	})
	.partial();

export type UpdateServerSettingsDto = z.infer<typeof updateServerSchema>;
