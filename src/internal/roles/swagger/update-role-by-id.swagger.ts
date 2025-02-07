import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { UpdateRoleByIdDto } from "../dto/update-role-by-id.dto";

export class UpdateRoleByIds {
	id: string;
	name: string;
	superRoleId: string | undefined;
	memberIds: string[];

	constructor(dto: UpdateRoleByIdDto) {
		this.id = dto.id;
		this.name = dto.name;
		this.superRoleId = dto.superRoleId;
		this.memberIds = dto.memberIds;
	}
}

export const updateRoleByIdOperationOptions: ApiOperationOptions = {
	summary: "Update role by id",
};

export const udpateRoleByIdBodyOptions: ApiBodyOptions = {
	type: UpdateRoleByIds,
	examples: {
		"Update role by id": {
			value: {
				id: "test-role",
				name: "Test Role",
				superRoleId: "admin",
			},
		},
	},
};
