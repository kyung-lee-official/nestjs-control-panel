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
export class UpdateApprovalGuard implements CanActivate {
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

		const actions = ["update"];

		/* find event and section role */
		const performanceEvent = await this.prismaService.event.findUnique({
			where: {
				id: eventId,
			},
			include: {
				section: true,
			},
		});
		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const sectionRoleId = performanceEvent.section.memberRoleId;
		const sectionSuperRoleIds =
			await this.utilsService.getSuperRoles(sectionRoleId);

		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const resource = {
			kind: "internal:applications:performances:event:approval",
			id: "*",
			attr: {
				// sectionRoleId: sectionRoleId,
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

		const result = !!decision.isAllowed("update");

		return result;
	}
}
