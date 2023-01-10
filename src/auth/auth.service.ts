import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private jwtService: JwtService
	) { }

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
}
