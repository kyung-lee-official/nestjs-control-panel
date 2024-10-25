import { ApiBodyOptions } from "@nestjs/swagger";
import { UpdateMemberProfileDto } from "../dto/update-member-profile.dto";

export class UpdateMemberProfile {
	nickname;

	constructor(dto: UpdateMemberProfileDto) {
		this.nickname = dto.nickname;
	}
}

export const updateMemberProfileBodyOptions: ApiBodyOptions = {
	type: UpdateMemberProfile,
	description: "The member profile to be updated",
	examples: {
		"Update Member Nickname 三": {
			value: {
				nickname: "Test Member 三",
			},
		},
		"Update Member Nickname 3": {
			value: {
				nickname: "Test Member 3",
			},
		},
	},
};
