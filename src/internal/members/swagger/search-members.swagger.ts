import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { FreezeMember } from "../dto/freeze-member.dto";

export const searchMemberOperationOptions: ApiOperationOptions = {
	summary: "Search members by email",
	description:
		"Conditionally find members by email (non-case-sensitive), name.",
};

export const searchMemberBodyOptions: ApiBodyOptions = {
	type: FreezeMember,
	examples: {
		"Example 1": {
			value: {
				email: process.env.E2E_TEST_ADMIN_EMAIL,
			},
		},
		"Example 2": {
			value: {
				email: process.env.E2E_TEST_ADMIN_NEW_EMAIL,
			},
		},
	},
};
