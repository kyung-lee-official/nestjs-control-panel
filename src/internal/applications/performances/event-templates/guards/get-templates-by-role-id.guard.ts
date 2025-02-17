import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class GetTemplatesByRoleIdGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["read"];
		const ownerRoleId = req.params.roleId as string;
		const ownerRole = await this.prismaService.memberRole.findUnique({
			where: {
				id: ownerRoleId,
			},
		});
		if (!ownerRole) {
			throw new BadRequestException("Role not found");
		}
		const resource: Resource = {
			kind: "internal:applications:performances:template",
			id: "*",
			attr: {
				ownerRole: ownerRole.id,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};

		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("read");

		return result;
	}
}
