import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CheckResourcesRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class FindRolesByIdsGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		const roles = await this.prismaService.memberRole.findMany({
			where: {
				id: {
					in: req.body.roleIds.length
						? req.body.roleIds
						: Prisma.skip,
				},
			},
		});
		const resources = roles.map((role) => ({
			resource: {
				kind: "internal:roles",
				id: role.id,
			},
			actions: actions,
		}));

		const checkResourcesRequest: CheckResourcesRequest = {
			principal: principal,
			resources: resources,
		};
		const decision = await this.cerbosService.cerbos.checkResources(
			checkResourcesRequest
		);

		const result = decision.results.every(
			(result) => result.actions.read === "EFFECT_ALLOW"
		);

		return result;
	}
}
