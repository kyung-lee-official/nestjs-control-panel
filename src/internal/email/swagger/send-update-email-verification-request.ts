import {
	ApiBody,
	ApiBodyOptions,
	ApiOkResponse,
	ApiOperation,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const sendUpdateEmailVerificationRequestApiOperationOptions: ApiOperationOptions =
	{
		description: `# Send an Update Email to the Member
Send a update email verification request to the member's new email. Valid for 1 day.`,
	};

export const sendUpdateEmailVerificationRequestApiBodyOptions: ApiBodyOptions =
	{
		description: "The new email",
		examples: {
			"New Email": {
				value: {
					newEmail: "test@example.com",
				},
			},
		},
	};

export const sendUpdateEmailVerificationRequestApiOkResponseOptions: ApiResponseOptions =
	{
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
