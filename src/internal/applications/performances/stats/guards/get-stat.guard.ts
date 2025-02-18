import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest, Principal, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class GetStatGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const id = req.params.id;
		const stat = await this.prismaService.performanceStat.findUnique({
			where: { id: parseInt(id) },
		});
		if (!stat) {
			throw new BadRequestException("stat not found");
		}
		const ownerId = stat.ownerId;
		const owner = await this.prismaService.member.findUnique({
			where: { id: ownerId },
			include: { memberRoles: true },
		});
		if (!owner) {
			throw new BadRequestException("owner not found");
		}

		const requester = req.requester;
		const principal: Principal = getCerbosPrincipal(requester);

		const actions = ["read"];

		const resource: Resource = {
			kind: "internal:applications:performances:stat",
			id: id,
			attr: {
				ownerId: owner.id,
				ownerRoles: {
					ownerRoleIds: owner.memberRoles.map((role) => role.id),
				},
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
