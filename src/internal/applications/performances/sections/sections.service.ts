import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { rm } from "fs/promises";

@Injectable()
export class SectionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createSectionDto: CreateSectionDto) {
		const { statId, weight, memberRoleId, title, description } =
			createSectionDto;
		const section = await this.prismaService.statSection.create({
			data: {
				statId: statId,
				weight: weight,
				memberRoleId: memberRoleId,
				title: title,
				description: description,
			},
		});
		return section;
	}

	async getSectionById(sectionId: number) {
		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
			include: {
				stat: {
					include: {
						owner: true,
					},
				},
				memberRole: true,
				events: true,
			},
		});
		return section;
	}

	async deleteSectionById(sectionId: number) {
		const section = await this.prismaService.$transaction(async (tx) => {
			const section = await tx.statSection.findUnique({
				where: {
					id: sectionId,
				},
				include: {
					events: true,
				},
			});
			if (!section) {
				throw new Error("Section not found");
			}
			for (const event of section.events) {
				/* delete event attachments */
				await rm(
					`./storage/internal/apps/performances/event-attachments/${event.id}`,
					{
						recursive: true,
						force: true,
					}
				);
				/* delete event comments */
				await tx.eventComment.deleteMany({
					where: {
						eventId: event.id,
					},
				});
				/* delete event */
				await tx.event.delete({
					where: {
						id: event.id,
					},
				});
			}
			/* delete section */
			const sectionBeenDeleted = await tx.statSection.delete({
				where: {
					id: sectionId,
				},
			});
			return sectionBeenDeleted;
		});
		return section;
	}
}
