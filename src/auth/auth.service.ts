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
		private caslAbilityFactory: CaslAbilityFactory,
		private jwtService: JwtService
	) { }

	async hasAdmin(): Promise<{ hasAdmin: boolean; }> {
		const users = await this.usersRepository.find();
		if (users.length > 0) {
			return { hasAdmin: true };
		} else {
			return { hasAdmin: false };
		}
	}

	async seed(createUserDto: CreateUserDto): Promise<User> {
		const users = await this.usersRepository.find();
		let user;
		if (users.length > 0) {
			throw new BadRequestException("System already seeded");
		} else {
			user = await this.usersService.create(createUserDto);
		}
		let role = this.rolesRepository.create({ name: "admin" });
		const permissions = Object.values(Permissions);
		role.permissions = permissions;
		role = await this.rolesRepository.save(role);
		user.roles = [role];
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
