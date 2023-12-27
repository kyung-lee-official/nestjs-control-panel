import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { MembersService } from "../../members/members.service";

@Injectable()
export class GroupsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private membersService: MembersService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let { member } = context.switchToHttp().getRequest();
		member = await this.membersService.findMembersByIds({ ids: [member.id] });
		const isAdmin = member.memberRoles.some((role) => {
			return role.name === "admin";
		});
		if (isAdmin) {
			return true;
		} else {
			if (member.ownedGroups.length > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
}
