import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const verifyNewEmailApiOperationOptions: ApiOperationOptions = {
	description: `# Verify the Member's New Email
Verify the member's new email with the verification token sent to the member's new email`,
};

export const verifyNewEmailApiBodyOptions: ApiBodyOptions = {
	description: "Verification token",
	examples: {
		"Verification token": {
			value: {
				verificationToken:
					"eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUyMjEyNTcsImV4cCI6MTcwNTMwNzY1N30.aa0f_7yfIX0G4DJMCotKS-hIk2SonIKnaIrJoRG6eKo",
			},
		},
	},
};

export const verifyNewEmailOkResponseOptions: ApiResponseOptions = {
	description: "Return true if the email is verified",
	content: {
		"application/json": {
			examples: {
				"Email is verified": {
					value: {
						isVerified: true,
					},
				},
			},
		},
	},
};
