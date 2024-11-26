import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { Prisma } from "@prisma/client";
import { CheckResourcesRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class FindRolesByIdsGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

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
		const decision = await cerbos.checkResources(checkResourcesRequest);

		const result = decision.results.every(
			(result) => result.actions.read === "EFFECT_ALLOW"
		);

		return result;
	}
}
