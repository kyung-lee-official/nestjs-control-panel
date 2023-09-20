import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
	ServiceUnavailableException,
} from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { Permissions } from "../permissions/permissions.enum";
import { User } from "../users/entities/user.entity";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError } from "@casl/ability";

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	async updateAdminPermissions(): Promise<Role> {
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

	async create(): Promise<Role> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
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

	async find(roleIds?: number[]): Promise<Role[]> {
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
				relations: ["users"],
			});
			return roles;
		} else {
			const roles = await this.rolesRepository.find({
				relations: ["users"],
			});
			return roles;
		}
	}

	async findOne(id: number): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: { id: id },
			relations: ["users"],
		});
		if (!role) {
			throw new NotFoundException("Role not found");
		}
		return role;
	}

	async updateRoleById(
		id: number,
		updateRoleDto: Partial<UpdateRoleDto>
	): Promise<Role> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const role = await this.rolesRepository.findOne({ where: { id: id } });
		if (!role) {
			throw new NotFoundException("Role not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.UPDATE, role);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const { name, permissions, userIds } = updateRoleDto;
		if (role.name === "admin") {
			throw new BadRequestException("Can not update admin role");
		}
		if (name) {
			if (name.toLowerCase() === "admin") {
				throw new BadRequestException("Can't rename the role to admin");
			}
			if (name.toLowerCase() === "common") {
				throw new BadRequestException(
					"Can't rename the role to common"
				);
			}
			if (name === "") {
				throw new BadRequestException("Role name can not be empty");
			}
			role.name = name;
		}
		if (permissions) {
			role.permissions = permissions;
		}
		if (userIds) {
			const users = await this.usersRepository.find({
				where: { id: In(userIds) },
			});
			role.users = users;
		}
		await this.rolesRepository.save(role);
		const dbRole = await this.rolesRepository.findOne({
			where: { id: id },
		});
		return dbRole;
	}

	async remove(id: number): Promise<any> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const role = await this.rolesRepository.findOne({
			where: { id: id },
		});
		if (!role) {
			throw new BadRequestException(`Role with ID ${id} not found`);
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
