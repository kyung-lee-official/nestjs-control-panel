import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../users/entities/user.entity";
import { Repository } from "typeorm";
import { REQUIRED_ROLES_KEY } from "../decorators/required-roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			REQUIRED_ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);
		if (!requiredRoles) {
			return true;
		}
		let { user } = context.switchToHttp().getRequest();
		user = await this.usersRepository.findOne({
			where: {
				id: user.id,
			},
			relations: ["roles"],
		});
		const rolesOfUser: string[] = user.roles?.map((role) => {
			return role.name;
		});

		/* At least has one required role */
		const hasRequiredRole = requiredRoles.some((requiredRole) => {
			return rolesOfUser?.includes(requiredRole);
		});
		return hasRequiredRole;
	}
}
