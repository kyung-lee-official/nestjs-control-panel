import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError, subject } from "@casl/ability";
import { PrismaService } from "../prisma/prisma.service";
import { MemberRole } from "@prisma/client";
import { FindMemberRoleDto } from "./dto/find-member-role.dto";

@Injectable({ scope: Scope.REQUEST })
export class MemberRolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	// async updateAdminPermissions(): Promise<MemberRole> {
	// 	const permissions = Object.values(Permission);
	// 	const adminRole = await this.prismaService.memberRole.update({
	// 		where: {
	// 			name: "admin",
	// 		},
	// 		data: {
	// 			permissions: permissions,
	// 		},
	// 	});
	// 	return adminRole;
	// }

	// async create(): Promise<MemberRole> {
	// 	const { requester } = this.request;
	// 	const ability =
	// 		await this.caslAbilityFactory.defineAbilityFor(requester);
	// 	async function generateNewRoleName(newRoleNameIndex: number) {
	// 		let newRoleName = "New Role";
	// 		if (newRoleNameIndex === 0) {
	// 			newRoleName = "New Role";
	// 		} else {
	// 			newRoleName = "New Role" + newRoleNameIndex;
	// 		}
	// 		let newRole = await this.prismaService.memberRole.findUnique({
	// 			where: {
	// 				name: newRoleName,
	// 			},
	// 		});
	// 		if (newRole) {
	// 			newRoleNameIndex++;
	// 			return await generateNewRoleName(newRoleNameIndex);
	// 		} else {
	// 			return newRoleName;
	// 		}
	// 	}
	// 	const newRoleName = await generateNewRoleName(0);
	// 	try {
	// 		ForbiddenError.from(ability).throwUnlessCan(
	// 			Actions.CREATE,
	// 			subject("MemberRole", {
	// 				name: newRoleName,
	// 				permissions: [],
	// 			} as any)
	// 		);
	// 	} catch (error) {
	// 		if (error instanceof ForbiddenError) {
	// 			throw new BadRequestException(error.message);
	// 		}
	// 		throw error;
	// 	}
	// 	const role = await this.prismaService.memberRole.create({
	// 		data: {
	// 			name: newRoleName,
	// 			permissions: [],
	// 		},
	// 	});
	// 	return role;
	// }

	// async find(findMemberRoleDto: FindMemberRoleDto): Promise<MemberRole[]> {
	// 	const { roleIds } = findMemberRoleDto;
	// 	const roles = await this.prismaService.memberRole.findMany({
	// 		where: roleIds.length
	// 			? {
	// 					id: {
	// 						in: roleIds,
	// 					},
	// 				}
	// 			: undefined,
	// 		include: {
	// 			members: true,
	// 		},
	// 	});
	// 	return roles;
	// }

	// async findOne(id: number): Promise<MemberRole> {
	// 	const role = await this.prismaService.memberRole.findUnique({
	// 		where: {
	// 			id: id,
	// 		},
	// 		include: {
	// 			members: true,
	// 		},
	// 	});
	// 	if (!role) {
	// 		throw new NotFoundException("member-role not found");
	// 	}
	// 	return role;
	// }

	// async updateMemberRoleById(
	// 	id: number,
	// 	updateMemberRoleDto: Partial<UpdateMemberRoleDto>
	// ): Promise<MemberRole> {
	// 	const { requester } = this.request;
	// 	const ability =
	// 		await this.caslAbilityFactory.defineAbilityFor(requester);
	// 	const role = await this.prismaService.memberRole.findUnique({
	// 		where: { id: id },
	// 	});
	// 	if (!role) {
	// 		throw new NotFoundException("member-role not found");
	// 	}
	// 	try {
	// 		ForbiddenError.from(ability).throwUnlessCan(
	// 			Actions.UPDATE,
	// 			subject("MemberRole", role)
	// 		);
	// 	} catch (error) {
	// 		if (error instanceof ForbiddenError) {
	// 			throw new BadRequestException(error.message);
	// 		}
	// 		throw error;
	// 	}
	// 	const { name, permissions, memberIds } = updateMemberRoleDto;
	// 	if (name) {
	// 		if (name.toLowerCase() === "admin") {
	// 			throw new BadRequestException(
	// 				'Can\'t rename the role to "admin"'
	// 			);
	// 		}
	// 		if (name.toLowerCase() === "default") {
	// 			throw new BadRequestException(
	// 				'Can\'t rename the role to "default"'
	// 			);
	// 		}
	// 		if (name === "") {
	// 			throw new BadRequestException(
	// 				"member-role name can not be empty"
	// 			);
	// 		}
	// 	}
	// 	const newRole = await this.prismaService.memberRole.update({
	// 		where: { id: id },
	// 		data: {
	// 			name: name,
	// 			permissions: permissions,
	// 			members: {
	// 				connect: memberIds?.map((id) => ({ id })),
	// 			},
	// 		},
	// 	});
	// 	return newRole;
	// }

	// async remove(id: number): Promise<any> {
	// 	const { requester } = this.request;
	// 	const ability =
	// 		await this.caslAbilityFactory.defineAbilityFor(requester);
	// 	const role = await this.prismaService.memberRole.findUnique({
	// 		where: { id: id },
	// 	});
	// 	if (!role) {
	// 		throw new BadRequestException(
	// 			`member-role with ID ${id} not found`
	// 		);
	// 	}
	// 	try {
	// 		ForbiddenError.from(ability).throwUnlessCan(
	// 			Actions.DELETE,
	// 			subject("MemberRole", role)
	// 		);
	// 	} catch (error) {
	// 		if (error instanceof ForbiddenError) {
	// 			throw new BadRequestException(error.message);
	// 		}
	// 		throw error;
	// 	}
	// 	const deletedMemberRole = await this.prismaService.memberRole.delete({
	// 		where: { id: id },
	// 	});
	// 	return deletedMemberRole;
	// }
}
