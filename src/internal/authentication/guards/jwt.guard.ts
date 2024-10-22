import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly prismaService: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.headers.authorization) {
			try {
				const payload: { email: string; iat: number; exp: number } =
					await this.jwtService.verify(
						req.headers.authorization.replace("Bearer ", "")
					);
				const requester = await this.prismaService.member.findUnique({
					where: {
						email: payload.email,
					},
					include: {
						memberRoles: true,
					},
				});
				if (!requester) {
					throw new UnauthorizedException("Invalid requester");
				}
				req.jwtPayload = payload;
				req.requester = requester;
				return true;
			} catch (error) {
				throw new UnauthorizedException("Invalid token");
			}
		} else {
			throw new BadRequestException("Missing token");
		}
	}
}
