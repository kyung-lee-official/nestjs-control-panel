import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";
import { SignUpDto } from "../dto/signup.dto";

export class SignUp {
	email: string;
	nickname: string;
	password: string;

	constructor(dto: SignUpDto) {
		this.email = dto.email;
		this.nickname = dto.nickname;
		this.password = dto.password;
	}
}

export const signUpOperationOptions: ApiOperationOptions = {
	summary: "Sign up a new member",
};

export const signUpBodyOptions: ApiBodyOptions = {
	type: SignUp,
	description: "The member to be signed up",
	examples: {
		"Sign Up Member": {
			value: {
				email: "member@example.com",
				nickname: "member",
				password: "1234Abcd!",
			},
		},
	},
};

export const signUpOkResponseOptions: ApiResponseOptions = {
	description: "Return the signed up member",
	content: {
		"application/json": {
			examples: {
				"Sign up a member account": {
					value: {
						id: "d08926c7-7315-4858-9b38-f0ae9dbff20f",
						email: "910006803@qq.com",
						nickname: "910006803",
						isVerified: false,
						isFrozen: false,
						createdAt: "2024-10-22T05:04:18.077Z",
						updatedAt: "2024-10-22T05:04:18.077Z",
						memberRoles: [
							{
								id: "default",
								name: "Default",
								superRoleId: "admin",
								createdAt: "2024-10-22T04:59:12.984Z",
								updatedAt: "2024-10-22T04:59:12.984Z",
							},
						],
					},
				},
			},
		},
	},
};

export const signUpForbiddenResponseOptions: ApiResponseOptions = {
	description: "Check if server settings allow public sign up",
};
