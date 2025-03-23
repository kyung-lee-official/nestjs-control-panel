import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { CreateMemberDto } from "../dto/create-member.dto";

export class CreateMember {
	email: string;
	name: string;

	constructor(dto: CreateMemberDto) {
		this.email = dto.email;
		this.name = dto.name;
	}
}

export const createMemberOperationOptions: ApiOperationOptions = {
	summary:
		"Create a member manually from a given email, usually by admin. Password will be generated and sent to the email. Verification not required.",
};

export const createMemberBodyOptions: ApiBodyOptions = {
	type: CreateMember,
	examples: {
		"Create test member 2 by email": {
			value: {
				email: process.env.E2E_TEST_MEMBER_2_EMAIL,
				name: process.env.E2E_TEST_MEMBER_2_NAME,
			},
		},
		"Create test member 3 by email": {
			value: {
				email: process.env.E2E_TEST_MEMBER_3_EMAIL,
				name: process.env.E2E_TEST_MEMBER_3_NAME,
			},
		},
	},
};
