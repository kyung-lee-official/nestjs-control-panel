import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest, Principal, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class UpdateStatGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService
	) {}

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
		const principal: Principal =
			await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["update"];

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

		const result = !!decision.isAllowed("update");

		return result;
	}
}
