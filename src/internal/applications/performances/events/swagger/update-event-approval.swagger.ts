import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";

export const updateApprovalApiOperationOptions: ApiOperationOptions = {
	summary: "Update an approval",
};

export const updateApprovalApiBodyOptions: ApiBodyOptions = {
	description: "Update event approval",
	examples: {
		PENDING: {
			value: {
				approval: "PENDING",
			},
		},
		APPROVED: {
			value: {
				approval: "APPROVED",
			},
		},
		REJECTED: {
			value: {
				approval: "REJECTED",
			},
		},
	},
};
