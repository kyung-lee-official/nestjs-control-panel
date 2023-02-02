import { SetMetadata } from "@nestjs/common";

export const REQUIRED_ROLES_KEY = "roles";

export const RequiredRoles = (...roles: string[]) => {
	return SetMetadata(REQUIRED_ROLES_KEY, roles);
};
