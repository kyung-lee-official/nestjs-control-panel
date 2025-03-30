import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { REQUEST } from "@nestjs/core";
import { CheckResourceRequest, Resource } from "@cerbos/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class EventTemplatesService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions(templateId: number) {
		const { requester } = this.request;
		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*", "create", "read", "update", "delete"];
		const template = await this.prismaService.eventTemplate.findUnique({
			where: {
				id: templateId,
			},
			include: {
				memberRole: true,
			},
		});
		if (!template) {
			throw new NotFoundException("Template not found");
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

		return decision;
	}

	async create(createEventTemplateDto: CreateEventTemplateDto) {
		return await this.prismaService.eventTemplate.create({
			data: createEventTemplateDto,
		});
	}

	async getByRoleId(roleId: string) {
		return await this.prismaService.eventTemplate.findMany({
			where: {
				memberRoleId: roleId,
			},
			include: {
				memberRole: true,
			},
		});
	}

	async getById(id: number) {
		return await this.prismaService.eventTemplate.findUnique({
			where: {
				id: id,
			},
			include: {
				memberRole: true,
			},
		});
	}

	findOne(id: number) {
		return `This action returns a #${id} eventTemplate`;
	}

	// update(id: number, updateEventTemplateDto: UpdateEventTemplateDto) {
	// 	return `This action updates a #${id} eventTemplate`;
	// }

	async deleteById(id: number) {
		return await this.prismaService.eventTemplate.delete({
			where: {
				id: id,
			},
		});
	}
}
