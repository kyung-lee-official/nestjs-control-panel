import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const updateSectionApiOperationOptions: ApiOperationOptions = {
	summary: "Update a performance section",
	description: `# Update a performance section`,
};

export const updateSectionApiBodyOptions: ApiBodyOptions = {
	description: `Update a performance section`,
	examples: {
		"Update a performance section": {
			value: {
				sectionId: 1,
				weight: 5,
				title: "A section title",
				description: "A section description",
			},
		},
	},
};
