import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const createStatApiOperationOptions: ApiOperationOptions = {
	summary: "Create a performance stat, UTC time",
	description: `# Create a performance stat, UTC time

[https://github.com/kyung-lee-official/nextjs-sandbox/tree/main/src/app/styles/date](https://github.com/kyung-lee-official/nextjs-sandbox/tree/main/src/app/styles/date)`,
};

export const createStatApiBodyOptions: ApiBodyOptions = {
	description: `Create a performance stat.`,
	examples: {
		"Create a performance stat": {
			value: {
				ownerId: "563e0a5d-dbcc-4ac3-acda-0ec841d78056",
				month: "2025-01-01",
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
