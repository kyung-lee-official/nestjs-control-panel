import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { FindRolesByIdsDto } from "../dto/find-roles-by-ids.dto";

export class FindRolesByIds {
	roleIds: string[];

	constructor(dto: FindRolesByIdsDto) {
		this.roleIds = dto.roleIds;
	}
}

export const findRolesByIdsOperationOptions: ApiOperationOptions = {
	summary: "Find roles by ids",
};

export const findRolesByIdsBodyOptions: ApiBodyOptions = {
	type: FindRolesByIds,
	examples: {
		"Find roles by ids": {
			value: {
				roleIds: ["admin", "default"],
			},
		},
	},
};
