import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class FindRolesByIdsGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const action = "read";

		const roles = await this.prismaService.memberRole.findMany({
			where: {
				id: {
					in: req.body.roleIds,
				},
			},
		});
		const resources = roles.map((role) => ({
			resource: {
				kind: "internal:roles",
				id: role.id,
			},
			actions: [action],
		}));

		const cerbosObject = {
			principal: {
				id: requester.id,
				roles: requester.roles.map((role) => role.id),
				attributes: principal,
			},
			resources: resources,
		};
		const decision = await cerbos.checkResources(cerbosObject);

		return false;
	}
}
