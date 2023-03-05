import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "./jwt-payload.interface";
import { Role } from "src/roles/entities/role.entity";
import { Permissions } from "src/permissions/permissions.enum";
import { REQUEST } from "@nestjs/core";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory/casl-ability.factory";
import { Group } from "src/groups/entities/group.entity";

@Injectable()
export class AuthService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private usersService: UsersService,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(Group)
		private groupsRepository: Repository<Group>,
		private caslAbilityFactory: CaslAbilityFactory,
		private jwtService: JwtService
	) { }

	async isSeeded(): Promise<{ isSeeded: boolean; }> {
		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
			return { isSeeded: true };
		} else {
			return { isSeeded: false };
		}
	}

	async seed(createUserDto: CreateUserDto): Promise<User> {
		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
			throw new BadRequestException("System already seeded");
		}
		let role = this.rolesRepository.create({ name: "admin" });
		role.permissions = Object.values(Permissions); /* Full permissions */
		role = await this.rolesRepository.save(role);
		let group = this.groupsRepository.create({ name: "everyone" });
		group = await this.groupsRepository.save(group);
		let user = await this.usersService.create(createUserDto);
		user.roles = [role];
		user.groups = [group];
		user = await this.usersRepository.save(user);
		return user;
	}

	async signUp(createUserDto: CreateUserDto): Promise<User> {
		const user = await this.usersService.create(createUserDto);
		return user;
	}

	async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string; }> {
		const { email, password } = authCredentialsDto;
		const user = await this.usersRepository.findOne({
			where: {
				email: email
			}
		});
		if (user && (await bcrypt.compare(password, user.password))) {
			const payload: JwtPayload = { email };
			const accessToken: string = await this.jwtService.sign(payload);
			return { accessToken };
		} else {
			throw new UnauthorizedException("Please check your sign in credentials");
		}
	}

	googleSignIn(req) {
		if (!req.user) {
			return 'No user from google';
		}

		return {
			message: 'User information from google',
			user: req.user
		};
	}
}
