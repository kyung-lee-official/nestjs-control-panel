import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { UpdateMyPasswordDto } from "../dto/update-my-password.dto";

export class UpdateMyPassword {
	oldPassword;
	newPassword;

	constructor(dto: UpdateMyPasswordDto) {
		this.oldPassword = dto.oldPassword;
		this.newPassword = dto.newPassword;
	}
}

export const updateMyPasswordOperationOptions: ApiOperationOptions = {
	summary: "Update my password, old password required",
};

export const updateMyPasswordBodyOptions: ApiBodyOptions = {
	type: UpdateMyPassword,
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
