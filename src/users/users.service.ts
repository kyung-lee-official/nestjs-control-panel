import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from "@nestjs/typeorm/dist/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { RolesService } from "src/roles/roles.service";
import { REQUEST } from "@nestjs/core";
import { Permissions } from "src/permissions/permissions.enum";
import { ForbiddenException } from "@nestjs/common/exceptions";
import { PermissionsService } from "src/permissions/permissions.service";
import { UpdateUserEmailDto } from "./dto/update-user-email.dto";
import { UpdateUserRolesDto } from "./dto/update-user-roles.dto";

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private rolesService: RolesService,
		private permissionsService: PermissionsService
	) { }

	async create(createUserDto: CreateUserDto): Promise<User> {
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
		});
		await this.usersRepository.save(user);
		return user;
	}

	async find(email?, nickname?, roleIds?): Promise<User[]> {
		const queryBuilder = this.usersRepository.createQueryBuilder("user")
			.leftJoinAndSelect("user.roles", "roles");
		if (email) {
			queryBuilder.where("user.email = :email", { email: email.toLowerCase() });
		}
		if (nickname) {
			queryBuilder.andWhere(
				"(LOWER(user.nickname) LIKE LOWER(:nickname))", { nickname: `%${nickname}%` }
			);
		}
		let users = await queryBuilder.getMany();
		if (roleIds) {
			roleIds = roleIds.map((roleId) => {
				return parseInt(roleId);
			});
			users = users.filter((user) => {
				const userRoleIds = user.roles.map((role) => {
					return role.id;
				});
				for (const roleId of roleIds) {
					if (userRoleIds.includes(roleId)) {
						return true;
					}
				}
				return false;
			});
		}
		return users;
	}

	async findOne(id: string): Promise<User> {
		let requester = this.request.user;
		const requesterPermissions = await this.permissionsService.getPermissionsByUserId(requester.id);
		if (requesterPermissions.includes(Permissions.GET_USER)) {
			const user = await this.usersRepository.findOne({
				where: {
					id: id
				},
				relations: ["roles"]
			});
			return user;
		}
		if (requesterPermissions.includes(Permissions.GET_ME)) {
			if (requester.id === id) {
				const user = await this.usersRepository.findOne({
					where: {
						id: id
					},
					relations: ["roles"]
				});
				return user;
			} else {
				throw new ForbiddenException();
			}
		}
	}

	async update(
		id: string,
		updateUserDto: Partial<UpdateUserDto>,
	): Promise<User> {
		let requester = this.request.user;
		const requesterPermissions = await this.permissionsService.getPermissionsByUserId(requester.id);
		if (requesterPermissions.includes(Permissions.UPDATE_USER)) {
			const user = await this.findOne(id);
			if (!user) {
				throw new NotFoundException("User not found");
			}
			Object.assign(user, updateUserDto);
			try {
				const result = await this.usersRepository.save(user);
				return result;
			} catch (error) {
				throw error;
			}
		}
		if (requesterPermissions.includes(Permissions.UPDATE_ME)) {
			if (requester.id === id) {
				const user = await this.findOne(id);
				if (!user) {
					throw new NotFoundException("User not found");
				}
				Object.assign(user, updateUserDto);
				try {
					const result = await this.usersRepository.save(user);
					return result;
				} catch (error) {
					throw error;
				}
			} else {
				throw new ForbiddenException();
			}
		}
	}

	async updateUserEmail(
		id: string,
		updateUserEmailDto: UpdateUserEmailDto,
	): Promise<User> {
		let requester = this.request.user;
		const requesterPermissions = await this.permissionsService.getPermissionsByUserId(requester.id);
		if (requesterPermissions.includes(Permissions.UPDATE_EMAIL)) {
			const user = await this.findOne(id);
			if (!user) {
				throw new NotFoundException("User not found");
			}
			Object.assign(user, updateUserEmailDto);
			try {
				const result = await this.usersRepository.save(user);
				return result;
			} catch (error) {
				throw error;
			}
		}
		if (requesterPermissions.includes(Permissions.UPDATE_MY_EMAIL)) {
			if (requester.id === id) {
				const user = await this.findOne(id);
				if (!user) {
					throw new NotFoundException("User not found");
				}
				Object.assign(user, updateUserEmailDto);
				try {
					const result = await this.usersRepository.save(user);
					return result;
				} catch (error) {
					throw error;
				}
			} else {
				throw new ForbiddenException();
			}
		}
	}

	async updateUserRoles(
		id: string,
		updateUserRolesDto: UpdateUserRolesDto,
	): Promise<User> {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		const roleIds = updateUserRolesDto.roles;
		const roles = await this.rolesService.find(roleIds);
		user.roles = roles;
		try {
			const result = await this.usersRepository.save(user);
			return result;
		} catch (error) {
			throw error;
		}
	}

	async remove(id: string): Promise<void> {
		const result = await this.usersRepository.delete({ id: id });
		if (result.affected === 0) {
			throw new NotFoundException(`Task with ID "${id}" not found.`);
		}
	}
}
