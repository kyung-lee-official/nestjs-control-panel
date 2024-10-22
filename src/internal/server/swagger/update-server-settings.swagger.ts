import { ApiBodyOptions } from "@nestjs/swagger";
import { UpdateServerSettings } from "../dto/update-server-settings.dto";

export const updateServerSettingsBodyOptions: ApiBodyOptions = {
	type: UpdateServerSettings,
	examples: {
		reset: {
			value: {
				allowPublicSignUp: false,
				allowGoogleSignIn: false,
			},
		},
		allowPublicSignUp: {
			value: {
				allowPublicSignUp: true,
			},
		},
		allowGoogleSignIn: {
			value: {
				allowGoogleSignIn: true,
			},
		},
	},
};
