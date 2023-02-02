import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/required-permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredPermissions) {
			return true;
		}
		let { user } = context.switchToHttp().getRequest();
		user = await this.usersRepository.findOne({
			where: {
				id: user.id
			},
			relations: ["roles"]
		});
		const permissionArrayOfOwnedRoles = user.roles?.map((role) => {
			return role.permissions;
		});
		let allPermissionsOfUser = [];
		if (permissionArrayOfOwnedRoles.length > 0) {
			allPermissionsOfUser = permissionArrayOfOwnedRoles.reduce((accumulator, currentValue) => {
				return accumulator.concat(currentValue);
			});
		}
		/* At least has one required permission */
		const hasRequiredPermission = requiredPermissions.some((requiredPermission) => {
			return allPermissionsOfUser?.includes(requiredPermission);
		});
		return hasRequiredPermission;
	}
}
