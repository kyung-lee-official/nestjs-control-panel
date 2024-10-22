import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";

@Injectable()
export class NotFrozenGuard implements CanActivate {
	constructor() {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const { requester } = req;

		if (requester.isFrozen) {
			throw new ForbiddenException("Your account is frozen");
		} else {
			return true;
		}
	}
}
