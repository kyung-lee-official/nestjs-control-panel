import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const changeEmailApiOperationOptions: ApiOperationOptions = {
	summary: "Change Email",
	description: `# Change Email
* change email
* set is email verified to false
* issue new jwt based on new email
* send a verification email to the new email, valid for 1 day.`,
};

export const changeEmailApiBodyOptions: ApiBodyOptions = {
	description: "The new email",
	examples: {
		"New Email": {
			value: {
				newEmail: "test@example.com",
			},
		},
	},
};

export const changeEmailApiOkResponseOptions: ApiResponseOptions = {
	description: "Return true if the email is sent",
	content: {
		"application/json": {
			examples: {
				"Email is sent": {
					value: {
						isSent: true,
					},
				},
			},
		},
	},
};
