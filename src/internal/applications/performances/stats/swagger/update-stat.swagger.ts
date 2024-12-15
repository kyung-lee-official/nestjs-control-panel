import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const updateStatApiOperationOptions: ApiOperationOptions = {
	summary: "Update a performance stat",
};

export const updateStatApiBodyOptions: ApiBodyOptions = {
	description: "Update a performance stat",
	examples: {
		"Update a performance stat": {
			value: {
				ownerId: "563e0a5d-dbcc-4ac3-acda-0ec841d78056",
				month: "2024-09-01T00:00:00.000Z",
				statSections: [
					{
						weight: 60,
						title: "Summary",
						description: "Description",
					},
					{
						weight: 40,
						title: "Summary",
					},
				],
			},
		},
	},
};
