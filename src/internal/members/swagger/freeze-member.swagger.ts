import { ApiBodyOptions } from "@nestjs/swagger";
import { FreezeMember } from "../dto/freeze-member.dto";

export const freezeMemberBodyOptions: ApiBodyOptions = {
	type: FreezeMember,
	examples: {
		"Freeze Member": {
			value: {
				isFrozen: true,
			},
		},
		"Unfreeze Member": {
			value: {
				isFrozen: false,
			},
		},
	},
};
