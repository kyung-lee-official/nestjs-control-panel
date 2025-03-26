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
import { EventTemplate } from "@prisma/client";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class CreateEventGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService
	) {}

	/**
	 * who can create an event:
	 * 	- the owner of the performance stat, or any superRole of the event's section
	 * what event templates can be used:
	 *  - only the templates that match the section's memberRole
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;

		const principal = await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["create"];

		const body = req.body;
		const templateId: number | undefined = body.templateId;
		let template: EventTemplate | null = null;
		if (templateId) {
			/* use template */
			template = await this.prismaService.eventTemplate.findUnique({
				where: {
					id: templateId,
				},
			});
			if (!template) {
				throw new NotFoundException("Template not found");
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
		if (template && template.memberRoleId !== section.memberRoleId) {
			throw new BadRequestException(
				"Template member role does not match section member role"
			);
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
				sectionMemberRoleId: section.memberRoleId,
				templateMemberRoleId: template ? template.memberRoleId : null,
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
