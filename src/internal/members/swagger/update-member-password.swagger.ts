import { ApiBodyOptions } from "@nestjs/swagger";
import { UpdateMemberPasswordDto } from "../dto/update-member-password.dto";

export class UpdateMemberPassword {
	oldPassword;
	newPassword;

	constructor(dto: UpdateMemberPasswordDto) {
		this.oldPassword = dto.oldPassword;
		this.newPassword = dto.newPassword;
	}
}

export const updateMemberPasswordBodyOptions: ApiBodyOptions = {
	type: UpdateMemberPassword,
	description: "The member password to be updated",
	examples: {
		"!1234Abcd": {
			value: {
				oldPassword: "1234Abcd!",
				newPassword: "!1234Abcd",
			},
		},
		"1234Abcd!": {
			value: {
				oldPassword: "!1234Abcd",
				newPassword: "1234Abcd!",
			},
		},
	},
};
