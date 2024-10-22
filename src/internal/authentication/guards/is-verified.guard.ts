import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * Guard to check if the requester is verified
 * This guard must be used after JwtGuard
 */
@Injectable()
export class IsVerifiedGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.jwtPayload) {
			const requester = await this.prismaService.member.findUnique({
				where: {
					email: req.jwtPayload.email,
				},
			});
			if (!requester) {
				throw new UnauthorizedException("Invalid requester");
			}
			if (!requester.isVerified) {
				throw new UnauthorizedException("Requester is not verified");
			}
			return true;
		} else {
			throw new BadRequestException("Missing jwt payload");
		}
	}
}
