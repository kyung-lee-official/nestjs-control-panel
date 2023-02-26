import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/required-permissions.decorator";
import { PermissionsService } from "../permissions.service";
import { Permissions } from "../permissions.enum";

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private permissionsService: PermissionsService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<Permissions[]>(REQUIRED_PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredPermissions) {
			return true;
		}
		let { user } = context.switchToHttp().getRequest();
		const allPermissionsOfUser = await this.permissionsService.getPermissionsByUserId(user.id);

		/* At least has one required permission */
		const hasRequiredPermission = requiredPermissions.some((requiredPermission: Permissions) => {
			return allPermissionsOfUser?.includes(requiredPermission);
		});
		return hasRequiredPermission;
	}
}
