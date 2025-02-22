import { ApiOperationOptions, ApiParamOptions } from "@nestjs/swagger";
import { FindRoleByIdDto } from "../dto/find-role-by-id.dto";

export class FindRoleById {
	roleId: string;

	constructor(dto: FindRoleByIdDto) {
		this.roleId = dto.roleId;
	}
}

export const findRoleByIdOperationOptions: ApiOperationOptions = {
	summary: "Find role by id",
};

export const findRoleByIdParamOptions: ApiParamOptions = {
	name: "id",
	type: String,
	description: "Role id",
	examples: {
		"find admin": {
			value: "admin",
		},
		"find default": {
			value: "default",
		},
	},
};
