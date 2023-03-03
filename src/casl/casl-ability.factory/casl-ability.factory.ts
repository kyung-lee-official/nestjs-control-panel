import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "src/chitubox-manual-feedbacks/entities/chitubox-manual-feedback-record.entity";
import { Group } from "src/groups/entities/group.entity";
import { Permissions } from "src/permissions/permissions.enum";
import { PermissionsService } from "src/permissions/permissions.service";
import { Role } from "src/roles/entities/role.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";

export enum Actions {
	CREATE = "CREATE",
	UPDATE = "UPDATE",
	READ = "READ",
	DELETE = "DELETE",
}

export type Subjects = InferSubjects<
	typeof User |
	typeof Role |
	typeof Group |
	typeof ChituboxManualFeedback
> | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private permissionsService: PermissionsService,
	) { }
	async defineAbilityFor(requesterId: string): Promise<AppAbility> {
		const dbRequester = await this.usersRepository.findOne({
			where: {
				id: requesterId
			},
			relations: [
				"groups",
				"ownedGroups"
			]
		});
		const requesterPermissions = await this.permissionsService.getPermissionsByUserId(dbRequester.id);
		const abilityBuilder = new AbilityBuilder<AppAbility>(createMongoAbility);
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
			can(Actions.UPDATE, User, { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "email", { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "email", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "roles", { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "roles", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.TRANSFER_ADMIN)) {
			can(Actions.UPDATE, User, "roles", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			can(Actions.UPDATE, User, "password", { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			can(Actions.UPDATE, User, "password", { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.GET_USERS)) {
			can(Actions.READ, User, { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
		}
		if (requesterPermissions.includes(Permissions.GET_ME)) {
			can(Actions.READ, User, { id: dbRequester.id });
		}
		if (requesterPermissions.includes(Permissions.DELETE_USER)) {
			can(Actions.DELETE, User, { groups: { $elemMatch: { id: { $in: ownedGroupIds } } } });
			cannot(Actions.DELETE, User, { roles: { $elemMatch: { name: "admin" } } })
				.because("Can't delete an admin user");
		}
		/* Role permissions */
		/* Group permissions */
		/* Permission permissions */
		const ability = build({
			detectSubjectType: (object) => {
				return object.constructor as ExtractSubjectType<Subjects>;
			}
		});
		return ability;
	}
}
