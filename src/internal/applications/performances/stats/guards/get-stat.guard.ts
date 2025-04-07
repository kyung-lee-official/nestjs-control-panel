import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CheckResourceRequest, Principal, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class GetStatGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
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
		const ownerRoleIds = owner.memberRoles.map((role) => role.id);
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(ownerRoleIds);

		const requester = req.requester;
		const principal: Principal =
			await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		const resource: Resource = {
			kind: "internal:applications:performances:stat",
			id: id,
			attr: {
				statOwnerId: owner.id,
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};

		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("read");

		return result;
	}
}
