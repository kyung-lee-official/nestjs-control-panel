import {
	AbilityBuilder,
	ExtractSubjectType,
	InferSubjects,
	MongoAbility,
	createMongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "../../chitubox-manual-feedbacks/entities/chitubox-manual-feedback-record.entity";
import { Group } from "../../groups/entities/group.entity";
import { Permissions } from "../../permissions/permissions.enum";
import { PermissionsService } from "../../permissions/permissions.service";
import { Role } from "../../roles/entities/role.entity";
import { User } from "../../users/entities/user.entity";
import { Repository } from "typeorm";

export enum Actions {
	CREATE = "CREATE",
	UPDATE = "UPDATE",
	READ = "READ",
	DELETE = "DELETE",
}

export type Subjects =
	| InferSubjects<
			| typeof User
			| typeof Role
			| typeof Group
			| typeof ChituboxManualFeedback
	  >
	| "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private permissionsService: PermissionsService
	) {}
	async defineAbilityFor(requesterId: string): Promise<AppAbility> {
		const dbRequester = await this.usersRepository.findOne({
			where: {
				id: requesterId,
			},
			relations: ["groups", "ownedGroups"],
		});
		const requesterPermissions =
			await this.permissionsService.getPermissionsByUserId(
				dbRequester.id
			);
		const abilityBuilder = new AbilityBuilder<AppAbility>(
			createMongoAbility
		);
		const { can, cannot, build } = abilityBuilder;
		const ownedGroupIds = dbRequester.ownedGroups.map((ownedGroup) => {
			return ownedGroup.id;
		});
		/* Auth permissions */
		if (requesterPermissions.includes(Permissions.CREATE_USER)) {
			can(Actions.CREATE, User);
		}
		/* User permissions */
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "email", {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "email", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "roles", {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "roles", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.TRANSFER_ADMIN)) {
			can(Actions.UPDATE, User, "roles", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "password", {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "password", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.GET_USERS)) {
			can(Actions.READ, User, {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.GET_ME)) {
			can(Actions.READ, User, { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.DELETE_USER)) {
			can(Actions.DELETE, User, {
				groups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
			cannot(Actions.DELETE, User, {
				roles: { $elemMatch: { name: "admin" } },
			}).because("Can't delete an admin user");
		}
		/* Role permissions */
		if (requesterPermissions.includes(Permissions.CREATE_ROLE)) {
			can(Actions.CREATE, Role);
			cannot(Actions.CREATE, Role, { name: "admin" }).because(
				'Can\'t create "admin" role'
			);
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ROLE)) {
			can(Actions.UPDATE, Role);
			cannot(Actions.UPDATE, Role, { name: "admin" }).because(
				'Can\'t update "admin" role'
			);
		}
		if (requesterPermissions.includes(Permissions.DELETE_ROLE)) {
			can(Actions.DELETE, Role);
			cannot(Actions.DELETE, Role, { name: "admin" }).because(
				'Can\'t delete "admin" role'
			);
		}
		/* Group permissions */
		if (requesterPermissions.includes(Permissions.CREATE_GROUP)) {
			can(Actions.CREATE, Group);
			cannot(Actions.CREATE, Group, { name: "everyone" }).because(
				'Can\'t create "everyone" group'
			);
		}
		if (requesterPermissions.includes(Permissions.UPDATE_GROUP)) {
			can(Actions.UPDATE, Group);
			cannot(Actions.UPDATE, Group, { name: "everyone" }).because(
				'Can\'t update "everyone" group'
			);
		}
		if (requesterPermissions.includes(Permissions.DELETE_GROUP)) {
			can(Actions.DELETE, Group);
			cannot(Actions.DELETE, Group, { name: "everyone" }).because(
				'Can\'t delete "everyone" group'
			);
		}
		/* Permission permissions */

		const ability = build({
			detectSubjectType: (object) => {
				return object.constructor as ExtractSubjectType<Subjects>;
			},
		});
		return ability;
	}
}
