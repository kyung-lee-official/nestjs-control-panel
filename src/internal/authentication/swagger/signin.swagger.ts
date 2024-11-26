import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";
import { SignInDto } from "../dto/signin.dto";

export class SignIn {
	email: string;
	password: string;

	constructor(dto: SignInDto) {
		this.email = dto.email;
		this.password = dto.password;
	}
}

export const signInOperationOptions: ApiOperationOptions = {
	summary: "Sign in",
	description: "Sign in",
};

export const signInBodyOptions: ApiBodyOptions = {
	type: SignIn,
	examples: {
		"Sign in as admin": {
			value: {
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			},
		},
		"Sign in as Test Member 1": {
			value: {
				email: process.env.E2E_TEST_MEMBER_2_EMAIL,
				password: "1234Abcd!",
			},
		},
	},
};

export const signIOnOkResponseOptions: ApiResponseOptions = {
	description: "Return the accessToken",
	content: {
		"application/json": {
			examples: {
				"Sign in a member account": {
					value: {
						accessToken:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbWJlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwMzc1NDQ3NywiZXhwIjoxNzAzNzY1Mjc3fQ.v5o3sbNf8hag9SLRCvPW9X8IonX5UeQYM9ms7fNwQiY",
					},
				},
			},
		},
	},
};
