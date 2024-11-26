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

	/**
	 * @note do not modify req.requester which was added in middleware
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.headers.authorization) {
			try {
				const payload: { email: string; iat: number; exp: number } =
					await this.jwtService.verify(
						req.headers.authorization.replace("Bearer ", "")
					);
				req.jwtPayload = payload;
				return true;
			} catch (error) {
				throw new UnauthorizedException("Invalid token");
			}
		} else {
			throw new BadRequestException("Missing token");
		}
	}
}
