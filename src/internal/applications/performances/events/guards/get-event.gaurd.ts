import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CheckResourceRequest, Resource } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class GetEventGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const eventId = parseInt(req.params.id);
		if (isNaN(eventId)) {
			throw new BadRequestException("Invalid event id");
		}

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		/* find event and section role */
		const event = await this.prismaService.event.findUnique({
			where: {
				id: eventId,
			},
			include: {
				section: {
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
				},
			},
		});
		if (!event) {
			throw new NotFoundException("Performance event not found");
		}
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(
				event.section.stat.owner.memberRoles.map((role) => role.id)
			);
		const statOwnerId = event.section.stat.ownerId;
		const sectionSuperRoleIds = await this.utilsService.getSuperRoles(
			event.section.memberRoleId
		);
		const resource: Resource = {
			kind: "internal:applications:performances:event",
			id: eventId.toString(),
			attr: {
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
				statOwnerId: statOwnerId,
				sectionSuperRoleIds: sectionSuperRoleIds,
			},
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("read");

		return result;
	}
}
