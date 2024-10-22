import { Injectable, NotFoundException } from "@nestjs/common";
import { Permissions } from "./permissions.enum";
import { uniq } from "lodash";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PermissionsService {
	constructor(private readonly prismService: PrismaService) {}

	find() {
		return Object.values(Permissions);
	}

	async getPermissionsByMemberId(id: string): Promise<Permissions[]> {
		const member = await this.prismService.member.findUnique({
			where: {
				id: id,
			},
			include: {
				memberRoles: true,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not exists");
		}
		// const permissionArrayOfOwnedRoles = member.memberRoles.map((role) => {
		// 	return role.permissions;
		// });
		// let allPermissionsOfMember = [];
		// if (permissionArrayOfOwnedRoles.length > 0) {
		// 	allPermissionsOfMember = permissionArrayOfOwnedRoles.reduce(
		// 		(accumulator, currentValue) => {
		// 			return accumulator.concat(currentValue);
		// 		}
		// 	);
		// }
		// allPermissionsOfMember = uniq(allPermissionsOfMember);
		// return allPermissionsOfMember;
		return [];
	}
}
