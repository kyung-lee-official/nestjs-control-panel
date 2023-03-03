import { Injectable, NotFoundException } from '@nestjs/common';
import { Permissions } from "./permissions.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { uniq } from "lodash";

@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) { }

	find() {
		return Object.values(Permissions);
	}

	async getPermissionsByUserId(id: string): Promise<Permissions[]> {
		const user = await this.usersRepository.findOne({
			where: {
				id: id
			},
			relations: ["roles"]
		});
		if (!user) {
			throw new NotFoundException("User not exists");
		}
		const permissionArrayOfOwnedRoles = user.roles.map((role) => {
			return role.permissions;
		});
		let allPermissionsOfUser = [];
		if (permissionArrayOfOwnedRoles.length > 0) {
			allPermissionsOfUser = permissionArrayOfOwnedRoles.reduce((accumulator, currentValue) => {
				return accumulator.concat(currentValue);
			});
		}
		allPermissionsOfUser = uniq(allPermissionsOfUser);
		return allPermissionsOfUser;
	}
}
