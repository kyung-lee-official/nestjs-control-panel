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
}
