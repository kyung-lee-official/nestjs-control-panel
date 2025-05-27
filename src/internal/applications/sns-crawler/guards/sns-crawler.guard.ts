import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class SnsCrawlerGuard implements CanActivate {
	constructor(
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["*"];

		const resource = {
			kind: "internal:applications:retail:sns-crawler",
			id: "*",
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("*");

		return result;
	}
}
