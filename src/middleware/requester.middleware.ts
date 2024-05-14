import {
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction } from "express";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RequesterMiddleware implements NestMiddleware {
	constructor(
		private jwtService: JwtService,
		private readonly prismaService: PrismaService
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		if ((req.headers as any).authorization) {
			try {
				const payload = this.jwtService.decode(
					(req.headers as any).authorization.replace("Bearer ", "")
				);
				const email = payload["email"];
				if (!email) {
					throw new UnauthorizedException("Invalid token");
				}
				const requester = await this.prismaService.member.findUnique({
					where: {
						email: email,
					},
				});
				if (!requester) {
					throw new UnauthorizedException("Member does not exist");
				}
				/* Attach requester to req so that subsequent Nest flow can access it */
				(req as any).requester = requester;
				next();
			} catch (error) {
				throw error;
			}
		} else {
			next();
		}
	}
}
