import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class CreateSectionGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["create"];

		const body = req.body;
		const statId: number = body.statId;
		const stat = await this.prismaService.performanceStat.findUnique({
			where: {
				id: statId,
			},
		});
		if (!stat) {
			throw new NotFoundException("Corresponding stat not found");
		}
		const statOwnerId = stat.ownerId;
		const statOwner = await this.prismaService.member.findUnique({
			where: {
				id: statOwnerId,
			},
			include: {
				memberRoles: true,
			},
		});
		if (!statOwner) {
			throw new NotFoundException("Corresponding stat owner not found");
		}
		const statOwnerRoleIds = statOwner.memberRoles.map((role) => role.id);
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(statOwnerRoleIds);

		const resource = {
			kind: "internal:applications:performances:section",
			id: "*",
			attr: {
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);
		
		const result = !!decision.isAllowed("create");

		return result;
	}
}
