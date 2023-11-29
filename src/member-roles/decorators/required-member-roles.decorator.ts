import { SetMetadata } from "@nestjs/common";

export const REQUIRED_MEMBER_ROLES_KEY = "memberRoles";

export const RequiredMemberRoles = (...memberRoles: string[]) => {
	return SetMetadata(REQUIRED_MEMBER_ROLES_KEY, memberRoles);
};
