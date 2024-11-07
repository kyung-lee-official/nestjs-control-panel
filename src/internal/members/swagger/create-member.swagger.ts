import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { CreateMemberDto } from "../dto/create-member.dto";

export class CreateMember {
	email: string;
	name: string;
	password: string;

	constructor(dto: CreateMemberDto) {
		this.email = dto.email;
		this.name = dto.name;
		this.password = dto.password;
	}
}

export const createMemberOperationOptions: ApiOperationOptions = {
	summary: "Create a member by email",
};

export const createMemberBodyOptions: ApiBodyOptions = {
	type: CreateMember,
	examples: {
		"Create a member by email": {
			value: {
				email: process.env.E2E_TEST_MEMBER_3_EMAIL,
				name: process.env.E2E_TEST_MEMBER_3_NAME,
				password: "1234Abcd!",
			},
		},
	},
};
