import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";

@Injectable()
export class IsVerifiedGuard implements CanActivate {
	constructor() {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const { requester } = req;

		if (requester) {
			if (requester.isVerified) {
				return true;
			} else {
				throw new ForbiddenException("Your account is not verified");
			}
		} else {
			throw new BadRequestException("Missing token");
		}
	}
}
