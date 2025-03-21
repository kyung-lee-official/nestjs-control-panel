import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { getCerbosPrincipal } from "src/utils/data";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class UpdateApprovalGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const eventId = req.params.id;

		const principal = getCerbosPrincipal(requester);

		const actions = ["update"];

		/* find event and event owner */
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
		const eventOwner = performanceEvent.section.stat.ownerId;
		// const superRoles = eventOwner.
		
		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const resource = {
			kind: "internal:applications:performances:event:approval",
			id: "*",
			attr: {
				// performanceEventBe,
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("create");

		return result;
	}
}
