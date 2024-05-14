import {
	Member,
	MemberGroup,
	MemberRole,
	ChituboxManualFeedback,
} from "@prisma/client";
import { PureAbility, AbilityBuilder } from "@casl/ability";
import { PrismaQuery, Subjects, createPrismaAbility } from "@casl/prisma";
import { Injectable } from "@nestjs/common";
import { Permissions } from "../../permissions/permissions.enum";
import { PrismaService } from "../../prisma/prisma.service";
import { uniq } from "lodash";

export enum Actions {
	CREATE = "CREATE",
	UPDATE = "UPDATE",
	READ = "READ",
	DELETE = "DELETE",
}

type AppAbility = PureAbility<
	[
		Actions,
		Subjects<{
			Member: Member;
			MemberRole: MemberRole;
			MemberGroup: MemberGroup;
			ChituboxManualFeedback: ChituboxManualFeedback;
		}>
	],
	PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
	constructor(private readonly prismaService: PrismaService) {}

	async defineAbilityFor(requester: Member): Promise<AppAbility> {
		const dbRequester = await this.prismaService.member.findUnique({
			where: {
				id: requester.id,
			},
			include: {
				ownedGroups: true,
				memberRoles: true,
			},
		});
		const permissionArrayOfOwnedRoles = dbRequester.memberRoles.map(
			(role) => {
				return role.permissions;
			}
		);
		let dbRequesterPermissions = [];
		if (permissionArrayOfOwnedRoles.length > 0) {
			dbRequesterPermissions = permissionArrayOfOwnedRoles.reduce(
				(accumulator, currentValue) => {
					return accumulator.concat(currentValue);
				}
			);
		}
		dbRequesterPermissions = uniq(dbRequesterPermissions);

		const { can, cannot, build } = new AbilityBuilder<AppAbility>(
			createPrismaAbility
		);

		const ownedGroupIds = dbRequester.ownedGroups.map((ownedGroup) => {
			return ownedGroup.id;
		});

		/* Auth permissions */
		if (dbRequesterPermissions.includes(Permissions.CREATE_MEMBER)) {
			can(Actions.CREATE, "Member");
		}

		/* Member permissions */
		if (dbRequesterPermissions.includes(Permissions.UPDATE_MEMBER)) {
			can(Actions.UPDATE, "Member", {
				memberGroups: {
					some: {
						id: { in: ownedGroupIds },
					},
				},
			});
		}
		if (dbRequesterPermissions.includes(Permissions.UPDATE_MEMBER_ME)) {
			can(Actions.UPDATE, "Member", { id: requester.id });
		}
		if (
			dbRequesterPermissions.includes(Permissions.TRANSFER_MEMBER_ADMIN)
		) {
			can(Actions.UPDATE, "MemberRole");
		}
		if (dbRequesterPermissions.includes(Permissions.GET_MEMBERS)) {
			can(Actions.READ, "Member", {
				memberGroups: {
					some: {
						id: { in: ownedGroupIds },
					},
				},
			});
		}
		if (dbRequesterPermissions.includes(Permissions.GET_MEMBER_ME)) {
			can(Actions.READ, "Member", { id: requester.id });
		}
		if (dbRequesterPermissions.includes(Permissions.DELETE_MEMBER)) {
			can(Actions.DELETE, "Member", {
				memberGroups: {
					some: {
						id: { in: ownedGroupIds },
					},
				},
			});
			cannot(Actions.DELETE, "Member", {
				memberRoles: {
					some: {
						name: "admin",
					},
				},
			}).because("Can't delete admin");
		}

		/* Member role permissions */
		if (dbRequesterPermissions.includes(Permissions.CREATE_MEMBER_ROLE)) {
			can(Actions.CREATE, "MemberRole");
			cannot(Actions.CREATE, "MemberRole", { name: "admin" }).because(
				"Can't create 'admin' member-role"
			);
		}
		if (dbRequesterPermissions.includes(Permissions.UPDATE_MEMBER_ROLE)) {
			can(Actions.UPDATE, "MemberRole");
			cannot(Actions.UPDATE, "MemberRole", { name: "admin" }).because(
				"Can't update 'admin' member-role"
			);
		}
		if (dbRequesterPermissions.includes(Permissions.DELETE_MEMBER_ROLE)) {
			can(Actions.DELETE, "MemberRole");
			cannot(Actions.DELETE, "MemberRole", { name: "admin" }).because(
				"Can't delete 'admin' member-role"
			);
		}

		/* Member group permissions */
		if (dbRequesterPermissions.includes(Permissions.CREATE_MEMBER_GROUP)) {
			can(Actions.CREATE, "MemberGroup");
			cannot(Actions.CREATE, "MemberGroup", { name: "everyone" }).because(
				"Can't create 'everyone' member-group"
			);
		}
		if (dbRequesterPermissions.includes(Permissions.UPDATE_MEMBER_GROUP)) {
			can(Actions.UPDATE, "MemberGroup", ["name", "members"]);
			cannot(Actions.UPDATE, "MemberGroup", { name: "everyone" }).because(
				"Can't update 'everyone' member-group"
			);
		}
		if (
			dbRequesterPermissions.includes(
				Permissions.TRANSFER_MEMBER_GROUP_OWNER
			)
		) {
			can(Actions.UPDATE, "MemberGroup", ["owner"]);
			cannot(Actions.UPDATE, "MemberGroup", { name: "everyone" }).because(
				"Can't update 'everyone' member-group"
			);
		}
		if (dbRequesterPermissions.includes(Permissions.DELETE_MEMBER_GROUP)) {
			can(Actions.DELETE, "MemberGroup");
			cannot(Actions.DELETE, "MemberGroup", { name: "everyone" }).because(
				"Can't delete 'everyone' member-group"
			);
		}

		/* Permission permissions */

		const ability = build();
		return ability;
	}
}
