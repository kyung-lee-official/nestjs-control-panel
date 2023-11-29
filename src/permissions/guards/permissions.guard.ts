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
		let { user: member } = context.switchToHttp().getRequest();
		const allPermissionsOfMember = await this.permissionsService.getPermissionsByMemberId(member.id);

		/* At least has one required permission */
		const hasRequiredPermission = requiredPermissions.some((requiredPermission: Permissions) => {
			return allPermissionsOfMember?.includes(requiredPermission);
		});
		return hasRequiredPermission;
	}
}
