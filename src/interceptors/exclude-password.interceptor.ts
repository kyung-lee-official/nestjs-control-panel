import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { excludePassword } from "../utils/data";

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();
		req.beforeHandlerData = "before handler data";
		return next.handle().pipe(
			map((data) => {
				return excludePassword(data);
			})
		);
	}
}
