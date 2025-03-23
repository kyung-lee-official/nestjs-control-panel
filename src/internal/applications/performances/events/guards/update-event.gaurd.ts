import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class UpdateEventGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService
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
				section: {
					include: {
						stat: true,
					},
				},
			},
		});
		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const performanceStatOwnerId = performanceEvent.section.stat.ownerId;
		const sectionRoleId = performanceEvent.section.memberRoleId;
		const superRoleIds =
			await this.utilsService.getSuperRoles(sectionRoleId);
		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const resource = {
			kind: "internal:applications:performances:event",
			id: "*",
			attr: {
				performanceStatOwnerId: performanceStatOwnerId,
				superRoleIds: superRoleIds,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("update");

		return result;
	}
}
