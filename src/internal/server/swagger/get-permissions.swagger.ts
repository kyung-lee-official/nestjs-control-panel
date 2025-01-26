import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const getPermissionsOperationOptions: ApiOperationOptions = {
	summary: "Get server setting permissions",
	description: "Get the permissions for the server settings.",
};

export const getPermissionsOkResponseOptions: ApiResponseOptions = {
	description: "Result of the server setting permissions.",
	content: {
		"application/json": {
			examples: {
				Allow: {
					value: {
						resource: {
							id: "*",
							kind: "internal:server-settings",
							policyVersion: "",
							scope: "",
						},
						actions: {
							"*": "EFFECT_ALLOW",
						},
						validationErrors: [],
						outputs: [],
					},
				},
			},
		},
	},
};
