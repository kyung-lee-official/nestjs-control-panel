import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
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
import { Group } from "src/groups/entities/group.entity";
import { ServerSetting } from "src/server-settings/entities/server-setting.entity";

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
		@InjectRepository(ServerSetting)
		private settingsRepository: Repository<ServerSetting>,
		private jwtService: JwtService
	) {}

	async isSeeded(): Promise<{ isSeeded: boolean }> {
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
		const serverSettings = this.settingsRepository.create({
			allowPublicSignUp: false,
			allowGoogleSignUp: false,
		});
		await this.settingsRepository.save(serverSettings);

		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
			throw new BadRequestException("Server already seeded");
		}
		let role = this.rolesRepository.create({ name: "admin" });
		role.permissions = Object.values(Permissions); /* Full permissions */
		role = await this.rolesRepository.save(role);
		let everyoneGroup = this.groupsRepository.create({ name: "everyone" });
		everyoneGroup = await this.groupsRepository.save(everyoneGroup);
		let user = await this.usersService.create(createUserDto);
		user.roles = [role];
		user.groups = [everyoneGroup];
		user.ownedGroups = [everyoneGroup];
		user = await this.usersRepository.save(user);
		return user;
	}

	async signUp(createUserDto: CreateUserDto): Promise<User> {
		const user = await this.usersService.create(createUserDto);
		return user;
	}

	async signIn(
		authCredentialsDto: AuthCredentialsDto
	): Promise<{ accessToken: string }> {
		const { email, password } = authCredentialsDto;
		const user = await this.usersRepository.findOne({
			where: {
				email: email,
			},
		});
		if (user && (await bcrypt.compare(password, user.password))) {
			const payload: JwtPayload = { email };
			const accessToken: string = this.jwtService.sign(payload);
			return { accessToken };
		} else {
			throw new UnauthorizedException(
				"Please check your sign in credentials"
			);
		}
	}

	async isSignedIn(): Promise<{ isSignedIn: boolean }> {
		return { isSignedIn: true };
	}

	googleSignIn(req: any) {
		if (!req.user) {
			return "No user from google";
		}

		return {
			message: "User information from google",
			user: req.user,
		};
	}
}
