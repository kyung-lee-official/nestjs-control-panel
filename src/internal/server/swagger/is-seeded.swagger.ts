import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const isSeededOperationOptions: ApiOperationOptions = {
	summary: "Check if the server is seeded",
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
