import { ApiBodyOptions } from "@nestjs/swagger";
import { UpdateMemberEmailDto } from "../dto/update-member-email.dto";

export class UpdateMemberEmail {
	email;

	constructor(dto: UpdateMemberEmailDto) {
		this.email = dto.email;
	}
}

export const updateMemberEmailBodyOptions: ApiBodyOptions = {
	type: UpdateMemberEmail,
	description: "The member email to be updated",
	examples: {
		"kyung.lee@foxmail.com": {
			value: {
				email: "kyung.lee@foxmail.com",
			},
		},
		"kyung.lee.official@gmail.com": {
			value: {
				email: "kyung.lee.official@gmail.com",
			},
		},
	},
};
