import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const updateEventAttachmentApiOperationOptions: ApiOperationOptions = {
	summary: "Upload an event attachment",
	description: `# Upload an event attachment`,
};

export const updateEventAttachmentApiBodyOptions: ApiBodyOptions = {
	schema: {
		type: "object",
		properties: {
			file: {
				type: "string",
				format: "binary",
			},
		},
	},
};
