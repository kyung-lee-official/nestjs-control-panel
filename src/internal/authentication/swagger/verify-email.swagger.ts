import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const verifyEmailOperationOptions: ApiOperationOptions = {
	description: `# Verify the Member's Email
Verify the member's email with the verification token sent to the member's email
`,
};

export const verifyEmailBodyOptions: ApiBodyOptions = {
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

export const verifyEmailOkResponseOptions: ApiResponseOptions = {
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
