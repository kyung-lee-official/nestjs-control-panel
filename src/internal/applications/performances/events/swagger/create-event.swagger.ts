import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const createEventApiOperationOptions: ApiOperationOptions = {
	summary: "Create an event",
};

export const createEventApiBodyOptions: ApiBodyOptions = {
	description: "Create an event",
	examples: {
		"Create an event ": {
			value: {
				templateId: 1,
				sectionId: 1,
				score: 90,
				amount: 1,
				description: "This is an event description",
				attachments: [],
			},
		},
	},
};
