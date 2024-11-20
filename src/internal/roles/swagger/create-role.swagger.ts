import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { CreateRoleDto } from "../dto/create-role.dto";

export class CreateRole {
	id: string;
	name: string;

	constructor(dto: CreateRoleDto) {
		this.id = dto.id;
		this.name = dto.name;
	}
}

export const createRoleOperationOptions: ApiOperationOptions = {
	summary: "Create a role",
};

export const createRoleBodyOptions: ApiBodyOptions = {
	type: CreateRole,
	examples: {
		"Create a role": {
			value: {
				id: "new-role",
				name: "New Role",
			},
		},
		"Create a role 2": {
			value: {
				id: "new-role-2",
				name: "New Role 2",
			},
		},
	},
};
