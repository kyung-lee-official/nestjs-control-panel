import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Member } from "../../members/entities/member.entity";
import { Repository } from "typeorm";
import { REQUIRED_MEMBER_ROLES_KEY } from "../decorators/required-member-roles.decorator";

@Injectable()
export class MemberRolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		@InjectRepository(Member)
		private membersRepository: Repository<Member>
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			REQUIRED_MEMBER_ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);
		if (!requiredRoles) {
			return true;
		}
		let { member } = context.switchToHttp().getRequest();
		member = await this.membersRepository.findOne({
			where: {
				id: member.id,
			},
			relations: ["memberRoles"],
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
