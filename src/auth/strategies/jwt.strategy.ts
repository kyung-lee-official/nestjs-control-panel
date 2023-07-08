import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { JwtPayload } from "../jwt-payload.interface";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {
		super({
			secretOrKey: process.env.JWT_SECRET,
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		const { email } = payload;
		const user: User = await this.usersRepository.findOne({
			where: {
				email: email
			}
		});
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
