import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GroupsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private usersService: UsersService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let { user } = context.switchToHttp().getRequest();
		user = await this.usersService.findOne(user.id);
		const isAdmin = user.roles.some((role) => {
			return role.name === "admin";
		});
		if (isAdmin) {
			return true;
		} else {
			if (user.ownedGroups.length > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
}
