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
import { GRPC as Cerbos } from "@cerbos/grpc";
import { getCerbosPrincipal } from "src/utils/data";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService
	) {}

	async permissions() {
		const { requester } = this.request;

		const principal = getCerbosPrincipal(requester);
		const actions = ["*"];
		const resource = {
			kind: "internal:roles",
			id: "*",
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

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
			const superRolesIdList = await this.getSuperRoles(superRoleId);
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
				superRole: {
					connect: superRoleId ? { id: superRoleId } : Prisma.skip,
				},
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
