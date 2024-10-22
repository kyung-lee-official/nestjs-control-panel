import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/required-permissions.decorator";
import { PermissionsService } from "../permissions.service";
import { Permissions } from "../permissions.enum";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { Member } from "@prisma/client";

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private permissionsService: PermissionsService,
		private jwtService: JwtService,
		private readonly prismaService: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<
			Permissions[]
		>(REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
		if (!requiredPermissions) {
			return true;
		}
		const req = context.switchToHttp().getRequest();
		let member: Member;
		if (req.headers.authorization) {
			const payload = this.jwtService.decode(
				req.headers.authorization.replace("Bearer ", "")
			);
			if (payload) {
				const email = payload["email"];
				member = await this.prismaService.member.findUnique({
					where: {
						email: email,
					},
					include: {
						memberRoles: true,
					},
				});
				if (!member) {
					throw new UnauthorizedException("Invalid token");
				}
				req.requester = member;
			} else {
				throw new UnauthorizedException("Invalid token");
			}
		} else {
			throw new BadRequestException("Missing token");
		}

		const allPermissionsOfMember =
			await this.permissionsService.getPermissionsByMemberId(member.id);

		/* At least has one required permission */
		const hasRequiredPermission = requiredPermissions.some(
			(requiredPermission: Permissions) => {
				return allPermissionsOfMember?.includes(requiredPermission);
			}
		);
		return hasRequiredPermission;
	}
}
