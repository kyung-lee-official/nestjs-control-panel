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
export class UpdateSectionGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["update"];

		const body = req.body;
		const sectionId: number = body.sectionId;
		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
			include: {
				stat: {
					include: {
						owner: {
							include: {
								memberRoles: true,
							},
						},
					},
				},
			},
		});
		if (!section) {
			throw new NotFoundException("Section not found");
		}
		const statOwnerRoleIds = section.stat.owner.memberRoles.map(
			(role) => role.id
		);
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

		const result = !!decision.isAllowed("update");

		return result;
	}
}
