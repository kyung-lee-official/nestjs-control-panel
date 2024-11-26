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
		const headers = req.headers as any;
		if (headers.authorization) {
			try {
				const payload = this.jwtService.decode(
					headers.authorization.replace("Bearer ", "")
				);
				const email = payload["email"];
				if (!email) {
					throw new UnauthorizedException("Invalid token");
				}
				const requester = await this.prismaService.member.findUnique({
					where: {
						email: email,
					},
					include: {
						memberRoles: true,
					},
				});
				if (!requester) {
					throw new UnauthorizedException("Invalid requester");
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
