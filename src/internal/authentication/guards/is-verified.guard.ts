import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class IsVerifiedGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		if (requester) {
			if (!requester.isVerified) {
				throw new UnauthorizedException("Requester is not verified");
			}
			return true;
		} else {
			throw new BadRequestException("Invalid requester");
		}
	}
}
