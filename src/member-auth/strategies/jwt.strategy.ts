import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { JwtPayload } from "../jwt-payload.interface";
import { Member } from "../../members/entities/member.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
	) {
		super({
			secretOrKey: process.env.JWT_SECRET,
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(payload: JwtPayload): Promise<Member> {
		const { email } = payload;
		const member: Member = await this.membersRepository.findOne({
			where: {
				email: email
			}
		});
		if (!member) {
			throw new UnauthorizedException();
		}
		return member;
	}
}
