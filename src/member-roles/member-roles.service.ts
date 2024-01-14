import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
	ServiceUnavailableException,
} from "@nestjs/common";
import { CreateMemberRoleDto } from "./dto/create-member-role.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { MemberRole } from "./entities/member-role.entity";
import { Permissions } from "../permissions/permissions.enum";
import { Member } from "../members/entities/member.entity";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError } from "@casl/ability";

@Injectable({ scope: Scope.REQUEST })
export class MemberRolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		@InjectRepository(MemberRole)
		private rolesRepository: Repository<MemberRole>,
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
		private caslAbilityFactory: CaslAbilityFactory
	) { }

	async updateAdminPermissions(): Promise<MemberRole> {
		const permissions = Object.values(Permissions);
		let adminRole = await this.rolesRepository.findOne({
			where: {
				name: "admin",
			},
		});
		adminRole.permissions = permissions;
		adminRole = await this.rolesRepository.save(adminRole);
		return adminRole;
	}

	async create(): Promise<MemberRole> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const rolesRepository = this.rolesRepository;
		async function generateNewRoleName(newRoleNameIndex: number) {
			let newRoleName = "New Role";
			if (newRoleNameIndex === 0) {
				newRoleName = "New Role";
			} else {
				newRoleName = "New Role" + newRoleNameIndex;
			}
			let newRole = await rolesRepository.findOne({
				where: {
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
		const role = this.rolesRepository.create({
			name: newRoleName,
			permissions: [],
		});

		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.CREATE, role);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		await this.rolesRepository.save(role);
		return role;
	}

	async find(roleIds?: number[]): Promise<MemberRole[]> {
		let ids: number[];
		if (roleIds) {
			ids = roleIds.map((id: number) => {
				if (Number.isNaN(id)) {
					throw new BadRequestException(
						"The values of ids must be numeric"
					);
				}
				return id;
			});
			const roles = await this.rolesRepository.find({
				where: {
					id: In(ids),
				},
				relations: ["members"],
			});
			return roles;
		} else {
			const roles = await this.rolesRepository.find({
				relations: ["members"],
			});
			return roles;
		}
	}

	async findOne(id: number): Promise<MemberRole> {
		const role = await this.rolesRepository.findOne({
			where: { id: id },
			relations: ["members"],
		});
		if (!role) {
			throw new NotFoundException("Member Role not found");
		}
		return role;
	}

	async updateMemberRoleById(
		id: number,
		updateMemberRoleDto: Partial<UpdateMemberRoleDto>
	): Promise<MemberRole> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const role = await this.rolesRepository.findOne({ where: { id: id } });
		if (!role) {
			throw new NotFoundException("Member Role not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.UPDATE, role);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const { name, permissions, memberIds } = updateMemberRoleDto;
		if (role.name === "admin") {
			throw new BadRequestException("Can not update admin role");
		}
		if (name) {
			if (name.toLowerCase() === "admin") {
				throw new BadRequestException("Can't rename the role to admin");
			}
			if (name.toLowerCase() === "default") {
				throw new BadRequestException(
					"Can't rename the role to default"
				);
			}
			if (name === "") {
				throw new BadRequestException("Member Role name can not be empty");
			}
			role.name = name;
		}
		if (permissions) {
			role.permissions = permissions;
		}
		if (memberIds) {
			const members = await this.membersRepository.find({
				where: { id: In(memberIds) },
			});
			role.members = members;
		}
		await this.rolesRepository.save(role);
		const dbMemberRole = await this.rolesRepository.findOne({
			where: { id: id },
		});
		return dbMemberRole;
	}

	async remove(id: number): Promise<any> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const role = await this.rolesRepository.findOne({
			where: { id: id },
		});
		if (!role) {
			throw new BadRequestException(`Member Role with ID ${id} not found`);
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.DELETE, role);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const result = await this.rolesRepository.delete(id);
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the role");
		}
		return result;
	}
}
