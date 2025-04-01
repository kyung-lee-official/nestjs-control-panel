import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { CheckResourceRequest, Principal, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class SearchStatGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const ownerId = req.body.ownerId;
		const owner = await this.prismaService.member.findUnique({
			where: { id: ownerId },
			include: { memberRoles: true },
		});
		if (!owner) {
			throw new BadRequestException("owner not found");
		}
		const ownerRoleIds = owner.memberRoles.map((role) => role.id);
		const ownerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(ownerRoleIds);

		const requester = req.requester;
		const principal: Principal =
			await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		const resource: Resource = {
			kind: "internal:applications:performances:stat",
			id: "*",
			attr: {
				ownerId: owner.id,
				ownerRoles: {
					ownerRoleIds: owner.memberRoles.map((role) => role.id),
				},
				ownerSuperRoleIds: ownerSuperRoleIds,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};

		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);
		console.log(decision.outputs);

		const result = !!decision.isAllowed("read");

		return result;
	}
}
