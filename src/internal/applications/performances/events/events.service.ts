import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService
	) {}

	async create(createEventDto: CreateEventDto) {
		const { templateId, sectionId, score, amount, description } =
			createEventDto;
		let template;
		if (templateId) {
			/* use template */
			template = await this.prismaService.eventTemplate.findUnique({
				where: {
					id: templateId,
				},
			});
		}
		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
		});
		if (!section) {
			throw new Error("Section not found");
		}
		const event = await this.prismaService.event.create({
			data: {
				templateId: templateId ? templateId : Prisma.skip,
				templateScore: templateId ? template.score : Prisma.skip,
				templateDescription: templateId
					? template.description
					: Prisma.skip,
				amount: amount || 1,
				description,
				score,
				section: {
					connect: {
						id: sectionId,
					},
				},
			},
		});
		return event;
	}

	async findAll() {
		return await this.prismaService.event.findMany();
	}

	async findEventById(id: number) {
		const event = await this.prismaService.event.findUnique({
			where: {
				id,
			},
			include: {
				section: true,
				comments: true,
			},
		});
		if (!event) {
			throw new NotFoundException("Event not found");
		}
		return event;
	}

	async updateEventById(id: number, updateEventDto: UpdateEventDto) {
		return await this.prismaService.event.update({
			where: {
				id,
			},
			data: updateEventDto,
		});
	}

	async remove(id: number) {
		await this.prismaService.eventComment.deleteMany({
			where: {
				eventId: id,
			},
		});
		return await this.prismaService.event.delete({
			where: {
				id,
			},
		});
	}
}
