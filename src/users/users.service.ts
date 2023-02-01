import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from "@nestjs/typeorm/dist/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { Role } from "src/roles/entities/role.entity";
import { RolesService } from "src/roles/roles.service";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private rolesService: RolesService
	) { }

	async create(createUserDto: CreateUserDto): Promise<User> {
		const { email, password, nickname } = createUserDto;
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
			queryBuilder.where("user.email = :email", { email: email });
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
		const user = await this.usersRepository.findOne({
			where: {
				id: id
			},
			relations: ["roles"]
		});
		return user;
	}

	async update(
		id: string,
		updateUserDto: Partial<UpdateUserDto>,
		roleIds?: string[]
	): Promise<User> {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		Object.assign(user, updateUserDto);

		if (roleIds) {
			const roles: Role[] = await this.rolesService.find(roleIds);
			user.roles = roles;
		}
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
