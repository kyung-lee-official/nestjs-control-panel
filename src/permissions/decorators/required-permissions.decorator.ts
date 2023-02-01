import { SetMetadata } from "@nestjs/common";

export const REQUIRED_PERMISSIONS_KEY = "permissions";

export const RequiredPermissions = (...permissions: string[]) => {
	return SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
};
