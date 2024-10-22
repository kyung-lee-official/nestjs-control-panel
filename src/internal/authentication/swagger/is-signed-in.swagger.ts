import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const isSignedInOperationOptions: ApiOperationOptions = {
	summary: "Check if the member is signed in",
};

export const isSignedInOkResponseOptions: ApiResponseOptions = {
	description: "Return true if the member is signed in",
	content: {
		"application/json": {
			examples: {
				"Member is signed in": {
					value: {
						isSignedIn: true,
					},
				},
			},
		},
	},
};

export const isSignedInUnauthorizedOptions: ApiResponseOptions = {
	description: "Member is not signed in",
	content: {
		"application/json": {
			examples: {
				"Member is not signed in": {
					value: {
						message: "Unauthorized",
						statusCode: 401,
					},
				},
			},
		},
	},
};
