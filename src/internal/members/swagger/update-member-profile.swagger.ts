import { ApiBodyOptions } from "@nestjs/swagger";
import { UpdateMemberProfileDto } from "../dto/update-member-profile.dto";

export class UpdateMemberProfile {
	name;

	constructor(dto: UpdateMemberProfileDto) {
		this.name = dto.name;
	}
}

export const updateMemberProfileBodyOptions: ApiBodyOptions = {
	type: UpdateMemberProfile,
	description: "The member profile to be updated",
	examples: {
		"Update Member Name 三": {
			value: {
				name: "Test Member 三",
			},
		},
		"Update Member Name 3": {
			value: {
				name: "Test Member 3",
			},
		},
	},
};
