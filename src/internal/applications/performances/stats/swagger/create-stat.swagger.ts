import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const createStatApiOperationOptions: ApiOperationOptions = {
	summary: "Create a performance stat",
};

export const createStatApiBodyOptions: ApiBodyOptions = {
	description: "Create a performance stat",
	examples: {
		"Create a performance stat": {
			value: {
				ownerId: "563e0a5d-dbcc-4ac3-acda-0ec841d78056",
			},
		},
	},
};
