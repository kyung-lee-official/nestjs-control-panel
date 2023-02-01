import { Injectable } from '@nestjs/common';
import { Permissions } from "./permissions.enum";

@Injectable()
export class PermissionsService {
	find() {
		return Permissions;
	}

	findOne(id: number) {
		return `This action returns a #${id} permission`;
	}
}
