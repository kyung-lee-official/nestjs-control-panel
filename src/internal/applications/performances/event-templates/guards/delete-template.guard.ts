import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CheckResourceRequest } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class DeleteTemplateGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		const requester = req.requester;
		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["delete"];

		const resource = {
			kind: "internal:applications:performances:template",
			id: "*",
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("delete");

		return result;
	}
}
