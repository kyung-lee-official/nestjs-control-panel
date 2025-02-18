import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const searchStatApiOperationOptions: ApiOperationOptions = {
	summary: "Search performance stats by ownerId and year, UTC time",
};

export const searchStatApiBodyOptions: ApiBodyOptions = {
	description: "Search performance stats by ownerId and year, UTC time",
	examples: {
		"Search stats of a member": {
			value: {
				ownerId: "563e0a5d-dbcc-4ac3-acda-0ec841d78056",
				year: "2025-09-01T00:00:00.000Z",
			},
		},
	},
};
