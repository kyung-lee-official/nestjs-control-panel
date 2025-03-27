import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { PrismaService } from "../../prisma/prisma.service";
import { MemberRole, Prisma } from "@prisma/client";
import { FindRolesByIdsDto } from "./dto/find-roles-by-ids.dto";
import { UpdateRoleByIdDto } from "./dto/update-role-by-id.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions() {
		const { requester } = this.request;

		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*", "read"];
		const resource = {
			kind: "internal:roles",
			id: "*",
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		return { ...decision };
	}

	async create(createRoleDto: CreateRoleDto): Promise<MemberRole> {
		const { id, name, superRoleId } = createRoleDto;
		const role = await this.prismaService.memberRole.create({
			data: {
				id: id,
				name: name,
				superRole: {
					connect: superRoleId ? { id: superRoleId } : Prisma.skip,
				},
			},
		});
		return role;
	}

	async getAllRoles() {
		const roles = await this.prismaService.memberRole.findMany({
			include: {
				members: true,
				superRole: true,
			},
		});
		return roles;
	}

	async findRolesByIds(findRolesByIdsDto: FindRolesByIdsDto) {
		const { roleIds } = findRolesByIdsDto;
		const roles = await this.prismaService.memberRole.findMany({
			where: roleIds.length
				? {
						id: {
							in: roleIds,
						},
					}
				: Prisma.skip,
			include: {
				members: true,
				superRole: true,
			},
		});
		return roles;
	}

	async findRoleById(id: string) {
		const role = await this.prismaService.memberRole.findUnique({
			where: {
				id: id,
			},
			include: {
				members: true,
				superRole: true,
			},
		});
		if (!role) {
			throw new NotFoundException("role not found");
		}
		return role;
	}

	async updateRoleById(
		updateRoleDto: UpdateRoleByIdDto
	): Promise<MemberRole> {
		const { id, name, superRoleId, memberIds } = updateRoleDto;
		if (id === "admin") {
			if (name !== "Admin") {
				throw new BadRequestException('Can\'t rename "admin" role');
			}
			if (memberIds.length < 1) {
				throw new BadRequestException(
					'"admin" role must have at least one member'
				);
			}
			if (superRoleId) {
				throw new BadRequestException(
					'"admin" can not have a super role'
				);
			}
		}
		if (id === "default") {
			throw new BadRequestException('Can\'t update "default" role');
		}
		if (name === "") {
			throw new BadRequestException("role name can not be empty");
		}
		if (id === superRoleId) {
			throw new BadRequestException("role can not be its own super role");
		}
		/* circular super role check */
		if (superRoleId) {
			const superRolesIdList =
				await this.utilsService.getSuperRoles(superRoleId);
			if (superRolesIdList.includes(id)) {
				throw new BadRequestException(
					"target super role is a sub-role of the current role, this will create a circular reference, which is not allowed"
				);
			}
		}

		const newRole = await this.prismaService.memberRole.update({
			where: { id: id },
			data: {
				name: name,
				superRole: superRoleId
					? { connect: { id: superRoleId } }
					: { disconnect: true },
				members: {
					set: !!memberIds.length
						? memberIds.map((id) => {
								return { id: id };
							})
						: [],
				},
			},
			include: {
				members: true,
				superRole: true,
			},
		});
		return newRole;
	}

	async remove(id: string) {
		if (id === "admin") {
			throw new BadRequestException("Cannot delete admin roles");
		}
		if (id === "default") {
			throw new BadRequestException("Cannot delete default roles");
		}
		const deletedRole = await this.prismaService.memberRole.delete({
			where: { id: id },
		});
		return deletedRole;
	}
}
