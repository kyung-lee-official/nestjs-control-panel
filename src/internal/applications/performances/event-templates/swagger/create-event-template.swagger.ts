import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const createEventTemplateApiOperationOptions: ApiOperationOptions = {
	summary: "Create an event template",
};

export const createEventTemplateApiBodyOptions: ApiBodyOptions = {
	description: "Create an event template",
	examples: {
		"Create an event template": {
			value: {
				score: 90,
				description: "This is a description",
				memberRoleId: "default",
			},
		},
	},
};
