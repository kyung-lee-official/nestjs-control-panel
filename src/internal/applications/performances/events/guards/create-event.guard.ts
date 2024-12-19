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
export class CreateEventGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = getCerbosPrincipal(requester);

		const actions = ["create"];

		const body = req.body;
		const templateId = body.templateId;
		if (templateId) {
			/* use template */
			const template = await this.prismaService.eventTemplate.findUnique({
				where: {
					id: templateId,
				},
			});
			if (!template) {
				throw new NotFoundException("Template not found");
			}
			if (!principal.roles.includes(template.memberRoleId)) {
				/* template role not matched */
				throw new ForbiddenException(
					"principal roles do not include template role"
				);
			}
		} else {
			/* custom event, no validation needed */
		}

		const sectionId = body.sectionId;
		if (!sectionId) {
			throw new BadRequestException("Section ID is required");
		}
		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
		});
		if (!section) {
			throw new NotFoundException("Section not found");
		}
		const performanceStat =
			await this.prismaService.performanceStat.findUnique({
				where: {
					id: section.statId,
				},
			});
		if (!performanceStat) {
			throw new NotFoundException("Performance stat not found");
		}
		const resource = {
			kind: "internal:applications:performances:event",
			id: "*",
			attr: {
				performanceStatOwnerId: performanceStat.ownerId,
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
