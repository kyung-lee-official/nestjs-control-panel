import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { Permissions } from "src/permissions/permissions.enum";
import { UsersService } from "src/users/users.service";
import { FindUsersByIdsDto } from "src/users/dto/find-users-by-ids.dto";
import { forwardRef } from "@nestjs/common/utils";

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@Inject(forwardRef(() => {
			return UsersService;
		}))
		private usersService: UsersService
	) { }

	async updateAdminPermissions(): Promise<Role> {
		const permissions = Object.values(Permissions);
		let adminRole = await this.rolesRepository.findOne({
			where: {
				role: "admin"
			}
		});
		adminRole.permissions = permissions;
		adminRole = await this.rolesRepository.save(adminRole);
		return adminRole;
	}

	async create(createRoleDto: CreateRoleDto): Promise<Role> {
		const role = this.rolesRepository.create(createRoleDto);
		try {
			await this.rolesRepository.save(role);
			return role;
		} catch (error) {
			if (error.code === "23505") {
				throw new ConflictException("Role already exists");
			}
		}
	}

	async find(roleIds?: number[]): Promise<Role[]> {
		let ids: number[];
		if (roleIds) {
			ids = roleIds.map((id: number) => {
				if (Number.isNaN(id)) {
					throw new BadRequestException("The values of ids must be numeric");
				}
				return id;
			});
		}

		let roles: Role[];
		if (ids) {
			roles = await this.rolesRepository.find({
				where: {
					id: In(ids)
				},
				relations: ["users"]
			});
			return roles;
		} else {
			roles = await this.rolesRepository.find({
				relations: ["users"]
			});
			return roles;
		}
	}

	async findOne(id: number): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: {
				id: id
			},
			relations: ["users"]
		});
		return role;
	}

	async update(id: number, updateRoleDto: Partial<UpdateRoleDto>) {
		const role = await this.findOne(id);
		if (!role) {
			throw new NotFoundException("Role not found");
		}
		if (role.role === "admin") {
			throw new BadRequestException("Can't update role \"admin\"");
		}
		const { permissions, userIds } = updateRoleDto;
		if (permissions) {
			role.permissions = permissions;
		}
		if (userIds) {
			const users = await this.usersService.findUsersByIds({ ids: userIds } as FindUsersByIdsDto);
			role.users = users;
		}
		try {
			await this.rolesRepository.save(role);
			const result = await this.findOne(id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	async remove(id: number): Promise<any> {
		const role = await this.findOne(id);
		if (!role) {
			throw new BadRequestException(`Role with ID ${id} not found`);
		}
		if (role.role === "admin") {
			throw new BadRequestException("Can not delete role \"admin\"");
		}
		if (role.users.length > 0) {
			throw new BadRequestException("Can not delete a role that has users");
		}
		const result = await this.rolesRepository.delete(id);
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the role");
		}
		return result;
	}
}
