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
import { rm } from "fs/promises";

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
					connect: { id: superRoleId },
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
		const { oldId, id, name, superRoleId, memberIds } = updateRoleDto;
		if (oldId !== id) {
			/* attempt to update the id of the role */
			const role = await this.prismaService.memberRole.findUnique({
				where: { id: oldId },
			});
			if (!role) {
				throw new NotFoundException("role not found");
			}
			/* check if the new id is already taken */
			const existingRole = await this.prismaService.memberRole.findUnique(
				{
					where: { id: id },
				}
			);
			if (existingRole) {
				throw new BadRequestException("role id already taken");
			}
			/* cannot update admin and default role id */
			if (oldId === "admin") {
				throw new BadRequestException("Cannot update admin role id");
			}
			if (oldId === "default") {
				throw new BadRequestException("Cannot update default role id");
			}
			/* update id */
			await this.prismaService.memberRole.update({
				where: { id: oldId },
				data: { id: id },
			});
		}

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
		} else {
			/* roles other than admin must have a super role */
			if (!superRoleId) {
				throw new BadRequestException(
					"roles other than admin must have a super role"
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
		/* recursive function to delete roles from bottom to top */
		const deleteRoleRecursively = async (
			roleId: string,
			tx: Prisma.TransactionClient
		) => {
			/* get sub-roles of the current role */
			const subRoleIds = await this.utilsService.getSubRolesOfRoles([
				roleId,
			]);

			/* recursively delete sub-roles */
			for (const subRoleId of subRoleIds) {
				await deleteRoleRecursively(subRoleId, tx);
			}

			/* delete corresponding resources for the current role */
			const sectionsToDelete = await tx.statSection.findMany({
				where: {
					memberRoleId: roleId,
				},
			});
			for (const section of sectionsToDelete) {
				const eventsToDelete = await tx.event.findMany({
					where: {
						sectionId: section.id,
					},
				});
				for (const event of eventsToDelete) {
					/* delete event attachments */
					await rm(
						`./storage/internal/apps/performances/event-attachments/${id}`,
						{
							recursive: true,
							force: true,
						}
					);
					/* delete event comments */
					await tx.eventComment.deleteMany({
						where: {
							eventId: event.id,
						},
					});
					/* delete event */
					await tx.event.delete({
						where: {
							id: event.id,
						},
					});
				}
			}
			await tx.statSection.deleteMany({
				where: {
					memberRoleId: roleId,
				},
			});
			await tx.eventTemplate.deleteMany({
				where: {
					memberRoleId: roleId,
				},
			});

			/* delete the role itself */
			await tx.memberRole.delete({
				where: {
					id: roleId,
				},
			});
		};

		/* use a transaction to ensure atomicity */
		const deleteRole = await this.prismaService.$transaction(async (tx) => {
			await deleteRoleRecursively(id, tx);
		});

		return deleteRole;
	}
}
