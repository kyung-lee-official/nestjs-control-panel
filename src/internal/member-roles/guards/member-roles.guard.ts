import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_MEMBER_ROLES_KEY } from "../decorators/required-member-roles.decorator";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class MemberRolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly prismaService: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			REQUIRED_MEMBER_ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);
		if (!requiredRoles) {
			return true;
		}
		let { member } = context.switchToHttp().getRequest();
		member = await this.prismaService.member.findUnique({
			where: {
				id: member.id,
			},
			include: {
				memberRoles: true,
			},
		});
		const rolesOfMember: string[] = member.memberRoles?.map((role) => {
			return role.name;
		});

		/* At least has one required role */
		const hasRequiredRole = requiredRoles.some((requiredRole) => {
			return rolesOfMember?.includes(requiredRole);
		});
		return hasRequiredRole;
	}
}
