import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { CreateMemberDto } from "../dto/create-member.dto";

export class CreateMember {
	email: string;
	nickname: string;
	password: string;

	constructor(dto: CreateMemberDto) {
		this.email = dto.email;
		this.nickname = dto.nickname;
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
				nickname: process.env.E2E_TEST_MEMBER_3_NICKNAME,
				password: "1234Abcd!",
			},
		},
	},
};
