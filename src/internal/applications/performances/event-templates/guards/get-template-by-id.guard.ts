import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CheckResourceRequest, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class GetTemplateByIdGuard implements CanActivate {
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
		const templateId = parseInt(req.params.id as string);
		const template = await this.prismaService.eventTemplate.findUnique({
			where: {
				id: templateId,
			},
			include: {
				memberRole: true,
			},
		});
		if (!template) {
			throw new BadRequestException("Template not found");
		}
		const resource: Resource = {
			kind: "internal:applications:performances:template",
			id: templateId.toString(),
			attr: {
				ownerRole: template.memberRoleId,
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
