import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const createSectionApiOperationOptions: ApiOperationOptions = {
	summary: "Create a performance section",
	description: `# Create a performance section`,
};

export const createSectionApiBodyOptions: ApiBodyOptions = {
	description: `Create a performance section`,
	examples: {
		"Create a performance section": {
			value: {
				statId: 16,
				weight: 5,
				memberRoleId: "default",
				title: "A section title",
				description: "A section description",
			},
		},
	},
};
