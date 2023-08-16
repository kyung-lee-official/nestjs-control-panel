import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm/dist/common";
import { In, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { REQUEST } from "@nestjs/core";
import {
	BadRequestException,
	ForbiddenException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common/exceptions";
import { UpdateUserEmailDto } from "./dto/update-user-email.dto";
import { UpdateUserRolesDto } from "./dto/update-user-roles.dto";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dto";
import { FindUsersByIdsDto } from "./dto/find-users-by-ids.dto";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError } from "@casl/ability";
import { Group } from "../groups/entities/group.entity";
import { Role } from "../roles/entities/role.entity";
import { uniq } from "lodash";
import { UpdateUserGroupsDto } from "./dto/update-user-groups.dto";
import { AuthService } from "../auth/auth.service";
import fs, { readFile, writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private authService: AuthService,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(Group)
		private groupsRepository: Repository<Group>,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	/**
	 * Create a new user, and assign to the "everyone" group.
	 * @param createUserDto
	 * @returns user
	 */
	async create(createUserDto: CreateUserDto): Promise<User> {
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const everyoneGroup = await this.groupsRepository.find({
			where: { name: "everyone" },
		});
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			groups: everyoneGroup,
		});
		await this.usersRepository.save(user);
		this.authService.sendVerificationEmail(email);
		return user;
	}

	/**
	 * Find users conditionally.
	 * Since CASL only determines "can" or "can not",
	 * this function only returns users belonging to owned groups of the requester only.
	 * @param email user email
	 * @param nickname user nickname
	 * @param roleIds user's role ids
	 * @returns user
	 */
	async find(
		email?: string,
		nickname?: string,
		roleIds?: any
	): Promise<User[]> {
		const requester = this.request.user;
		const dbRequester = await this.usersRepository.findOne({
			where: { id: requester.id },
			relations: ["ownedGroups"],
		});
		const requesterOwnedGroupIds: number[] = dbRequester.ownedGroups.map(
			(group) => {
				return group.id;
			}
		);
		const userQb = this.usersRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.roles", "roles")
			.leftJoinAndSelect("user.groups", "groups")
			.leftJoinAndSelect("user.ownedGroups", "ownedGroups");
		if (email) {
			userQb.where("user.email = :email", { email: email.toLowerCase() });
		}
		if (nickname) {
			userQb.andWhere("(LOWER(user.nickname) LIKE LOWER(:nickname))", {
				nickname: `%${nickname}%`,
			});
		}
		userQb.andWhere("(groups.id IN (:...groupIds))", {
			groupIds: requesterOwnedGroupIds,
		});
		let users = await userQb.getMany();
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

	/**
	 * Find users by ids. If unknown ids exist in findUsersByIdsDto, ignore them, doesn't throw.
	 * @param findUsersByIdsDto
	 * @returns users
	 */
	async findUsersByIds(
		findUsersByIdsDto: FindUsersByIdsDto
	): Promise<User[]> {
		const requester = this.request.user;
		const { ids } = findUsersByIdsDto;
		const users = await this.usersRepository.find({
			where: {
				id: In(ids),
			},
			relations: ["roles", "groups", "ownedGroups"],
		});
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		for (const user of users) {
			if (!ability.can(Actions.READ, user)) {
				throw new ForbiddenException();
			}
		}
		return users;
	}

	async findMe(): Promise<User> {
		const requester = this.request.user;
		const dbRequester = await this.usersRepository.findOne({
			where: { id: requester.id },
			relations: ["roles", "groups", "ownedGroups"],
		});
		return dbRequester;
	}

	async findOne(id: string): Promise<User> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const user = await this.usersRepository.findOne({
			where: { id: id },
			relations: ["roles", "groups", "ownedGroups"],
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (ability.can(Actions.READ, user)) {
			return user;
		} else {
			throw new ForbiddenException();
		}
	}

	async update(
		id: string,
		updateUserDto: Partial<UpdateUserDto>
	): Promise<User> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const user = await this.usersRepository.findOne({
			where: { id: id },
			relations: ["roles", "groups"],
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (ability.can(Actions.UPDATE, user)) {
			Object.assign(user, updateUserDto);
			const result = await this.usersRepository.save(user);
			return result;
		} else {
			throw new ForbiddenException();
		}
	}

	async updateUserEmail(
		id: string,
		updateUserEmailDto: UpdateUserEmailDto
	): Promise<User> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const user = await this.usersRepository.findOne({
			where: { id: id },
			relations: ["roles", "groups"],
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (ability.can(Actions.UPDATE, user, "email")) {
			Object.assign(user, updateUserEmailDto);
			const result = await this.usersRepository.save(user);
			return result;
		} else {
			throw new ForbiddenException();
		}
	}

	/**
	 * Update user's roles.
	 * Throws a forbidden exception if updateUserRolesDto contains the 'admin' role.
	 * If the requestee is an admin user, keep the 'admin' role anyway.
	 * If updateUserRolesDto contains unknown roleIds, ignore them, doesn't throw.
	 * @param id user id
	 * @param updateUserRolesDto
	 * @returns user
	 */
	async updateUserRoles(
		id: string,
		updateUserRolesDto: UpdateUserRolesDto
	): Promise<User> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const adminRole = await this.rolesRepository.findOne({
			where: { name: "admin" },
		});
		let user: User;
		let roles: Role[];
		if (updateUserRolesDto.roleIds) {
			if (updateUserRolesDto.roleIds.includes(adminRole.id)) {
				throw new ForbiddenException(
					"Can't assign the 'admin' role to other users"
				);
			}
			roles = await this.rolesRepository.find({
				where: { id: In(updateUserRolesDto.roleIds) },
			});
			user = await this.usersRepository.findOne({
				where: { id: id },
				relations: ["roles"],
			});
			if (!user) {
				throw new NotFoundException("User not found");
			}
			const userRoleIds = user.roles.map((role) => {
				return role.id;
			});
			if (userRoleIds.includes(adminRole.id)) {
				/* Requestee has 'admin' role */
				roles.push(adminRole);
				roles = uniq(roles);
			}
		} else {
			throw new BadRequestException("Empty body, missing 'roleIds'");
		}

		if (ability.can(Actions.UPDATE, user, "roles")) {
			user.roles = roles;
			const result = await this.usersRepository.save(user);
			return result;
		} else {
			throw new ForbiddenException();
		}
	}

	async updateUserGroups(
		id: string,
		updateUserGroupsDto: UpdateUserGroupsDto
	): Promise<User> {
		return;
	}

	async updateUserPassword(
		id: string,
		updateUserPasswordDto: UpdateUserPasswordDto
	): Promise<User> {
		let requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const user = await this.usersRepository.findOne({ where: { id: id } });
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (ability.can(Actions.UPDATE, user, "password")) {
			const { oldPassword, newPassword } = updateUserPasswordDto;
			const isOldPasswordCorrect: boolean = await bcrypt.compare(
				oldPassword,
				user.password
			);
			if (isOldPasswordCorrect) {
				if (oldPassword === newPassword) {
					throw new BadRequestException(
						"The new password cannot be the same as the old password"
					);
				}
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(newPassword, salt);
				user.password = hashedPassword;
				await this.usersRepository.save(user);
				return user;
			} else {
				throw new UnauthorizedException();
			}
		} else {
			throw new ForbiddenException();
		}
	}

	async updateAvatar(req: any, file: Express.Multer.File): Promise<any> {
		const { mimetype } = file;
		if (!req.user) {
			throw new UnauthorizedException();
		}
		if (mimetype === "image/png") {
			if (file.size > 1024 * 1024) {
				throw new BadRequestException("File size too large");
			}
			const directoryPath = `storage/app/avatar/${req.user.id}`;
			if (!existsSync(directoryPath)) {
				mkdirSync(directoryPath, { recursive: true });
			}
			const filePath = directoryPath + "/avatar.png";
			await writeFile(filePath, file.buffer);
			return { message: "Avatar updated" };
		} else {
			throw new BadRequestException("Only png images are allowed");
		}
	}

	async downloadAvatar(id: string, req: any, res: any): Promise<any> {
		if (!req.user) {
			throw new UnauthorizedException();
		}
		const directoryPath = `storage/app/avatar/${req.user.id}`;
		const filePath = directoryPath + "/avatar.png";
		if (!existsSync(filePath)) {
			throw new NotFoundException("Avatar not found");
		}
		res.download(filePath);
	}

	async transferAdmim(id: string): Promise<User> {
		return;
	}

	async remove(id: string): Promise<any> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const user = await this.usersRepository.findOne({
			where: { id: id },
			relations: ["groups"],
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.DELETE, user);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const result = await this.usersRepository.delete({ id: id });
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the user");
		}
		return result;
	}
}
