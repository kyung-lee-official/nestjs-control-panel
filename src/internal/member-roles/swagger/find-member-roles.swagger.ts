import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { FindMemberRolesByIdsDto } from "../dto/find-member-roles-by-ids.dto";

export class FindMemberRolesByIds {
	roleIds: string[];

	constructor(dto: FindMemberRolesByIdsDto) {
		this.roleIds = dto.roleIds;
	}
}

export const findMemberRolesByIdsOperationOptions: ApiOperationOptions = {
	summary: "Find member-roles by ids",
};

export const findMembersRolesByIdsBodyOptions: ApiBodyOptions = {
	type: FindMemberRolesByIds,
	examples: {
		"Find member-roles by ids": {
			value: {
				roleIds: [],
			},
		},
	},
};
