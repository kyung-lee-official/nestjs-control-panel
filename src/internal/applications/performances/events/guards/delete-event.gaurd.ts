import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class DeleteEventGuard implements CanActivate {
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

		const actions = ["delete"];

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
		const statOwnerId = event.section.stat.ownerId;
		const sectionRoleId = event.section.memberRoleId;
		const sectionSuperRoleIds =
			await this.utilsService.getSuperRoles(sectionRoleId);
		if (!event) {
			throw new NotFoundException("Performance event not found");
		}
		const resource = {
			kind: "internal:applications:performances:event",
			id: "*",
			attr: {
				statOwnerId: statOwnerId,
				sectionSuperRoleIds: sectionSuperRoleIds,
				score: event.score,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("delete");

		return result;
	}
}
