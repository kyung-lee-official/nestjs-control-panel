import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Principal } from "@cerbos/core";

@Injectable()
export class UtilsService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * Get all super roles of a role
	 * @param roleId role id to get super roles
	 * @returns list of super roles id
	 */
	async getSuperRoles(roleId: string): Promise<string[]> {
		const superRolesIdList: string[] = [];
		const prismaService = this.prismaService;
		async function checkRecursively(roleId: string) {
			const superRole = await prismaService.memberRole.findUnique({
				where: {
					id: roleId,
				},
				include: {
					superRole: true,
				},
			});
			if (superRole?.superRole) {
				superRolesIdList.push(superRole.superRole.id);
				await checkRecursively(superRole.superRole.id);
			}
		}
		await checkRecursively(roleId);
		return superRolesIdList;
	}

	async getSubRoles(roleIds: string[]): Promise<string[]> {
		const allSubRoleIds: string[] = [];
		/* find all subroles of the requester recursively */
		const prismaService = this.prismaService;
		async function findSubRolesRecursively(roleIds: string[]) {
			const roles = await prismaService.memberRole.findMany({
				where: {
					superRoleId: {
						in: roleIds,
					},
				},
			});
			if (roles.length === 0) {
				return;
			}
			const ids = roles.map((role) => role.id);
			allSubRoleIds.push(...ids);
			await findSubRolesRecursively(ids);
		}
		await findSubRolesRecursively(roleIds);
		return allSubRoleIds;
	}

	async getCerbosPrincipal(requester: any): Promise<Principal> {
		return {
			id: requester.id,
			roles: requester.memberRoles.map((role) => role.id),
			attr: {
				...requester,
				memberRoles: requester.memberRoles.map((role) => {
					return {
						id: role.id,
						name: role.name,
						superRoleId: role.superRoleId,
						createdAt: role.createdAt.toISOString(),
						updatedAt: role.updatedAt.toISOString(),
					};
				}),
				createdAt: requester.createdAt.toISOString(),
				updatedAt: requester.updatedAt.toISOString(),
			},
		};
	}

	async generatePassword() {
		var length = Math.floor(Math.random() * 10) + 8,
			charset =
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=",
			retVal = "";
		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.random() * n);
		}
		return retVal;
	}
}
