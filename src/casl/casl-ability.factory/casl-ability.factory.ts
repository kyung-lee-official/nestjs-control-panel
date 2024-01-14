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
import { MemberGroup } from "../../member-groups/entities/member-group.entity";
import { Permissions } from "../../permissions/permissions.enum";
import { PermissionsService } from "../../permissions/permissions.service";
import { MemberRole } from "../../member-roles/entities/member-role.entity";
import { Member } from "../../members/entities/member.entity";
import { Repository } from "typeorm";

export enum Actions {
	CREATE = "CREATE",
	UPDATE = "UPDATE",
	READ = "READ",
	DELETE = "DELETE",
}

export type Subjects =
	| InferSubjects<
			| typeof Member
			| typeof MemberRole
			| typeof MemberGroup
			| typeof ChituboxManualFeedback
	  >
	| "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
		private permissionsService: PermissionsService
	) {}
	async defineAbilityFor(requester: Member): Promise<AppAbility> {
		const requesterPermissions =
			await this.permissionsService.getPermissionsByMemberId(
				requester.id
			);
		const abilityBuilder = new AbilityBuilder<AppAbility>(
			createMongoAbility
		);
		const { can, cannot, build } = abilityBuilder;
		const ownedGroupIds = requester.ownedGroups.map((ownedGroup) => {
			return ownedGroup.id;
		});

		/* Auth permissions */
		if (requesterPermissions.includes(Permissions.CREATE_MEMBER)) {
			can(Actions.CREATE, Member);
		}

		/* Member permissions */
		if (requesterPermissions.includes(Permissions.UPDATE_MEMBER)) {
			can(Actions.UPDATE, Member, {
				memberGroups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.UPDATE_MEMBER_ME)) {
			can(Actions.UPDATE, Member, { id: requester.id });
		}
		if (requesterPermissions.includes(Permissions.TRANSFER_MEMBER_ADMIN)) {
			can(Actions.UPDATE, MemberRole);
		}
		if (requesterPermissions.includes(Permissions.GET_MEMBERS)) {
			can(Actions.READ, Member, {
				memberGroups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
		}
		if (requesterPermissions.includes(Permissions.GET_MEMBER_ME)) {
			can(Actions.READ, Member, { id: requester.id });
		}
		if (requesterPermissions.includes(Permissions.DELETE_MEMBER)) {
			can(Actions.DELETE, Member, {
				memberGroups: { $elemMatch: { id: { $in: ownedGroupIds } } },
			});
			cannot(Actions.DELETE, Member, {
				memberRoles: { $elemMatch: { name: "admin" } },
			}).because("Can't delete admin");
		}

		/* Member role permissions */
		if (requesterPermissions.includes(Permissions.CREATE_MEMBER_ROLE)) {
			can(Actions.CREATE, MemberRole);
			cannot(Actions.CREATE, MemberRole, { name: "admin" }).because(
				'Can\'t create "admin" member-role'
			);
		}
		if (requesterPermissions.includes(Permissions.UPDATE_MEMBER_ROLE)) {
			can(Actions.UPDATE, MemberRole);
			cannot(Actions.UPDATE, MemberRole, { name: "admin" }).because(
				'Can\'t update "admin" member-role'
			);
		}
		if (requesterPermissions.includes(Permissions.DELETE_MEMBER_ROLE)) {
			can(Actions.DELETE, MemberRole);
			cannot(Actions.DELETE, MemberRole, { name: "admin" }).because(
				'Can\'t delete "admin" member-role'
			);
		}

		/* Member group permissions */
		if (requesterPermissions.includes(Permissions.CREATE_MEMBER_GROUP)) {
			can(Actions.CREATE, MemberGroup);
			cannot(Actions.CREATE, MemberGroup, { name: "everyone" }).because(
				'Can\'t create "everyone" member-group'
			);
		}
		if (requesterPermissions.includes(Permissions.UPDATE_MEMBER_GROUP)) {
			can(Actions.UPDATE, MemberGroup, ["name", "memberIds"]);
			cannot(Actions.UPDATE, MemberGroup, { name: "everyone" }).because(
				'Can\'t update "everyone" member-group'
			);
		}
		if (
			requesterPermissions.includes(
				Permissions.TRANSFER_MEMBER_GROUP_OWNER
			)
		) {
			can(Actions.UPDATE, MemberGroup, ["owner"]);
			cannot(Actions.UPDATE, MemberGroup, { name: "everyone" }).because(
				'Can\'t update "everyone" member-group'
			);
		}
		if (requesterPermissions.includes(Permissions.DELETE_MEMBER_GROUP)) {
			can(Actions.DELETE, MemberGroup);
			cannot(Actions.DELETE, MemberGroup, { name: "everyone" }).because(
				'Can\'t delete "everyone" member-group'
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
