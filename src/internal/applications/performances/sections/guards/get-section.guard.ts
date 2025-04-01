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
export class GetSectionGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		const sectionId: number = parseInt(req.params.sectionId);
		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
			include: {
				memberRole: true,
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
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(
				section.stat.owner.memberRoles.map((role) => role.id)
			);
		const sectionSuperRoleIds = await this.utilsService.getSuperRoles(
			section.memberRole.id
		);
		const statOwnerId = section.stat.owner.id;

		const resource = {
			kind: "internal:applications:performances:section",
			id: "*",
			attr: {
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
				sectionSuperRoleIds: sectionSuperRoleIds,
				statOwnerId: statOwnerId,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);
		console.log(decision);
		console.log(decision.outputs[0].value);

		const result = !!decision.isAllowed("read");

		return result;
	}
}
