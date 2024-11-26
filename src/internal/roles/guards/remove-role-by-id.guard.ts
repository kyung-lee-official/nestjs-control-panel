import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class RemoveRoleByIdGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["remove"];

		const role = await this.prismaService.memberRole.findUnique({
			where: {
				id: req.params.id,
			},
		});
		if (!role) {
			throw new NotFoundException("Role not found");
		}

		const resource = {
			kind: "internal:roles",
			id: role.id,
			attr: {
				...role,
				createdAt: role.createdAt.toISOString(),
				updatedAt: role.updatedAt.toISOString(),
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("remove");

		return result;
	}
}
