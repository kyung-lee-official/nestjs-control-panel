import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class IsAdmin implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		return true;
	}
}
