import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { REQUEST } from "@nestjs/core";

@Injectable()
export class EventTemplatesService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService
	) {}

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
