import { ApiBodyOptions } from "@nestjs/swagger";
import { FindMembersByIds } from "../dto/find-members-by-ids.dto";

export const findMembersByIdsBodyOptions: ApiBodyOptions = {
	type: FindMembersByIds,
	examples: {
		"Find Members By Ids": {
			value: {
				ids: ["c7e6804c-466c-46c5-88a6-fa9077f83cf2"],
			},
		},
	},
};
