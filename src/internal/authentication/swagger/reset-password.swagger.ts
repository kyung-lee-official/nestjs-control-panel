import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const resetPasswordApiOperationOptions: ApiOperationOptions = {
	summary: "# Reset the Member's Password",
};

export const resetPasswordApiBodyOptions: ApiBodyOptions = {
	schema: {
		properties: {
			password: {
				type: "string",
				format: "password",
				description: "The new password",
				example: "1234Abcd!",
			},
			resetPasswordToken: {
				type: "string",
				description: "The reset password token",
				example:
					"eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUzODE1MDYsImV4cCI6MTcwNTM4MjEwNn0.9jltcXaagYqJ-6Cq8d0z_GuQj8BL-NguAKvrp3QqJq0",
			},
		},
	},
	description: "Reset password with the reset password token",
	examples: {
		"Reset Password": {
			value: {
				password: "1234Abcd!",
				resetPasswordToken:
					"eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUzODE1MDYsImV4cCI6MTcwNTM4MjEwNn0.9jltcXaagYqJ-6Cq8d0z_GuQj8BL-NguAKvrp3QqJq0",
			},
		},
	},
};
