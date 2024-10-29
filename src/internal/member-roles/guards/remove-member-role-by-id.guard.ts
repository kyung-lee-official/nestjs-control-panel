import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class RemoveMemberRoleByIdGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const action = "remove";

		const role = await this.prismaService.memberRole.findUnique({
			where: {
				id: req.param.id,
			},
		});
		if (!role) {
			throw new NotFoundException("Role not found");
		}

		const resource = {
			kind: "internal:member-roles",
			id: role.id,
			attributes: {
				...role,
				createdAt: role.createdAt.toISOString(),
				updatedAt: role.updatedAt.toISOString(),
			},
		};

		const cerbosObject = {
			principal: {
				id: requester.id,
				roles: requester.memberRoles.map((role) => role.id),
				attributes: principal,
			},
			resource: resource,
			actions: [action],
		};
		const decision = await cerbos.checkResource(cerbosObject);

		const result = !!decision.isAllowed(action);

		return result;
	}
}
