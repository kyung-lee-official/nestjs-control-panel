import { Injectable, NotFoundException } from "@nestjs/common";
import { Permissions } from "./permissions.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../members/entities/member.entity";
import { uniq } from "lodash";

@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>
	) { }

	find() {
		return Object.values(Permissions);
	}

	async getPermissionsByMemberId(id: string): Promise<Permissions[]> {
		const member = await this.membersRepository.findOne({
			where: {
				id: id,
			},
			relations: ["memberRoles"],
		});
		if (!member) {
			throw new NotFoundException("Member not exists");
		}
		const permissionArrayOfOwnedRoles = member.memberRoles.map((role) => {
			return role.permissions;
		});
		let allPermissionsOfMember = [];
		if (permissionArrayOfOwnedRoles.length > 0) {
			allPermissionsOfMember = permissionArrayOfOwnedRoles.reduce(
				(accumulator, currentValue) => {
					return accumulator.concat(currentValue);
				}
			);
		}
		allPermissionsOfMember = uniq(allPermissionsOfMember);
		return allPermissionsOfMember;
	}
}
