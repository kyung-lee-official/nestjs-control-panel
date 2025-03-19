import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const resetPasswordApiOperationOptions: ApiOperationOptions = {
	summary: "Reset Password",
	description:
		"Reset the Member's Password, typically after a forget password request, server will send an email with a link that contains a reset password token, by clicking the link, the user will be redirected to the reset password page, where the user can reset the password",
};

export const resetPasswordApiBodyOptions: ApiBodyOptions = {
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
