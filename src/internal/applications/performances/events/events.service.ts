import { Inject, Injectable } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EventsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService
	) {}

	async create(createEventDto: CreateEventDto) {
		const {
			templateId,
			sectionId,
			score,
			amount,
			description,
			attachments,
		} = createEventDto;
		let template;
		if (templateId) {
			/* use template */
			template = await this.prismaService.eventTemplate.findUnique({
				where: {
					id: templateId,
				},
			});
		}
		const section = await this.prismaService.statSection.update({
			where: {
				id: sectionId,
			},
			data: {
				events: {
					create: {
						templateId: template ? template.id : undefined,
						templateScore: template ? template.score : 0,
						templateDescription: template
							? template.description
							: "",
						score,
						amount: amount,
						description: description,
						attachments: attachments,
					},
				},
			},
		});
		const performanceStat =
			await this.prismaService.performanceStat.findUnique({
				where: {
					id: section.statId,
				},
				include: {
					statSections: {
						include: {
							events: true,
						},
					},
				},
			});
		return performanceStat;
	}

	findAll() {
		return `This action returns all events`;
	}

	findOne(id: number) {
		return `This action returns a #${id} event`;
	}

	//   update(id: number, updateEventDto: UpdateEventDto) {
	//     return `This action updates a #${id} event`;
	//   }

	remove(id: number) {
		return `This action removes a #${id} event`;
	}
}
