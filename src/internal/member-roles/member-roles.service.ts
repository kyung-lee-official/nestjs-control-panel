import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { PrismaService } from "../../prisma/prisma.service";
import { MemberRole } from "@prisma/client";
import { FindMemberRolesByIdsDto } from "./dto/find-member-roles-by-ids.dto";
import { UpdateMemberRoleByIdDto } from "./dto/update-member-role-by-id.dto";

@Injectable({ scope: Scope.REQUEST })
export class MemberRolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService
	) {}

	async create(): Promise<MemberRole> {
		const { requester } = this.request;
		const prismaService = this.prismaService;

		async function generateNewRoleName(newRoleNameIndex: number) {
			let newRoleName = "New Role";
			if (newRoleNameIndex === 0) {
				newRoleName = "New Role";
			} else {
				newRoleName = "New Role" + newRoleNameIndex;
			}
			let newRole = await prismaService.memberRole.findUnique({
				where: {
					id: newRoleName,
					name: newRoleName,
				},
			});
			if (newRole) {
				newRoleNameIndex++;
				return await generateNewRoleName(newRoleNameIndex);
			} else {
				return newRoleName;
			}
		}
		const newRoleName = await generateNewRoleName(0);

		const role = await this.prismaService.memberRole.create({
			data: {
				id: newRoleName,
				name: newRoleName,
			},
		});
		return role;
	}

	async findMemberRolesByIds(
		findMemberRolesByIdsDto: FindMemberRolesByIdsDto
	) {
		const { roleIds } = findMemberRolesByIdsDto;
		const roles = await this.prismaService.memberRole.findMany({
			where: roleIds.length
				? {
						id: {
							in: roleIds,
						},
					}
				: undefined,
			include: {
				members: true,
			},
		});
		return roles;
	}

	async findMemberRoleById(id: string) {
		const role = await this.prismaService.memberRole.findUnique({
			where: {
				id: id,
			},
			include: {
				members: true,
			},
		});
		if (!role) {
			throw new NotFoundException("member-role not found");
		}
		return role;
	}

	async updateMemberRoleById(
		id: string,
		updateMemberRoleDto: UpdateMemberRoleByIdDto
	): Promise<MemberRole> {
		const { name, superRoleId, memberIds } = updateMemberRoleDto;
		// if (name) {
		// 	if (name.toLowerCase() === "admin") {
		// 		throw new BadRequestException(
		// 			'Can\'t rename the role to "admin"'
		// 		);
		// 	}
		// 	if (name.toLowerCase() === "default") {
		// 		throw new BadRequestException(
		// 			'Can\'t rename the role to "default"'
		// 		);
		// 	}
		// 	if (name === "") {
		// 		throw new BadRequestException(
		// 			"member-role name can not be empty"
		// 		);
		// 	}
		// }
		const newRole = await this.prismaService.memberRole.update({
			where: { id: id },
			data: {
				name: name,
				superRole: {
					connect: superRoleId ? { id: superRoleId } : undefined,
				},
				members: {
					connect: memberIds.map((id) => ({ id })),
				},
			},
		});
		return newRole;
	}

	async remove(id: string) {
		const deletedMemberRole = await this.prismaService.memberRole.delete({
			where: { id: id },
		});
		return deletedMemberRole;
	}
}
