import { ApiOperationOptions, ApiParamOptions } from "@nestjs/swagger";
import { CreateRoleDto } from "../dto/create-role.dto";

export class DeleteRole {
	id: string;

	constructor(dto: CreateRoleDto) {
		this.id = dto.id;
	}
}

export const deleteRoleOperationOptions: ApiOperationOptions = {
	summary: "Delete a role by id",
	description:
		"Remove role by id, delete even if the member-role has members",
};

export const deleteRoleParamsOptions: ApiParamOptions = {
	name: "id",
	description: "id of the member-role to delete",
};
