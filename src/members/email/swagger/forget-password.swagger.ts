import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const forgetPasswordApiOperationOptions: ApiOperationOptions = {
	description: `# Send a Forget Password Email to the Member
Send a forget password email to the member's email that contains a reset password token. Valid for 10 minutes.`,
};

export const forgetPasswordApiBodyOptions: ApiBodyOptions = {
	description: "The member's email",
	examples: {
		"Member's Email": {
			value: {
				email: "test@example.com",
			},
		},
	},
};

export const forgetPasswordNotFoundApiResponseOptions: ApiResponseOptions = {
	description: "Member not found",
	content: {
		"application/json": {
			examples: {
				"Member not found": {
					value: {
						message: "Member not found",
						error: "Not Found",
						statusCode: 404,
					},
				},
			},
		},
	},
};
