import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../entities/member.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class IsVerifiedGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		@InjectRepository(Member)
		private membersRepository: Repository<Member>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.headers.authorization) {
			try {
				const payload = this.jwtService.decode(
					req.headers.authorization.replace("Bearer ", "")
				);
				const email = payload["email"];
				if (!email) {
					throw new UnauthorizedException("Invalid token");
				}
				const requester = await this.membersRepository.findOne({
					where: {
						email: email,
					},
				});
				if (!requester) {
					throw new UnauthorizedException("Member does not exist");
				}
				if (requester.isVerified) {
					return true;
				} else {
					throw new ForbiddenException("Member is not verified");
				}
			} catch (error) {
				throw new UnauthorizedException("Invalid token");
			}
		} else {
			throw new BadRequestException("Missing token");
		}
	}
}
