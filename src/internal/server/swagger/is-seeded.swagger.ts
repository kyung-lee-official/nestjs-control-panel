import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const isSeededOperationOptions: ApiOperationOptions = {
	summary: "Check if the server is seeded",
	description:
		'If the server is seeded, check if at least one member exists, if at least one member exists, return `{ "isSeeded": true }`, frontend then redirects to the sign-in page.',
};

export const isSeededOkResponseOptions: ApiResponseOptions = {
	description: "Return true if the server is seeded",
	content: {
		"application/json": {
			examples: {
				Seeded: {
					value: {
						isSeeded: true,
					},
				},
				"Not Seeded": {
					value: {
						isSeeded: false,
					},
				},
			},
		},
	},
};
