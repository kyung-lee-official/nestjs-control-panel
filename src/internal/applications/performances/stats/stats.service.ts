import {
	BadRequestException,
	Body,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateStatDto } from "./dto/create-stat.dto";
import { UpdateStatDto } from "./dto/update-stat.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { rm } from "fs/promises";
import { SearchStatDto } from "./dto/search-stat.dto";
import dayjs from "dayjs";

@Injectable()
export class StatsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createStatDto: CreateStatDto) {
		const { ownerId, month, statSections } = createStatDto;
		const monthISOString = dayjs(month).startOf("month").toISOString();

		/* check weight sum */
		const weightSum = statSections.reduce(
			(acc, curr) => acc + curr.weight,
			0
		);
		if (weightSum !== 100) {
			throw new BadRequestException("Weight sum must be 100");
		}

		/* check if the stat of this month already exists */
		const existingStat = await this.prismaService.performanceStat.findFirst(
			{
				where: {
					ownerId: ownerId,
					month: monthISOString,
				},
			}
		);
		if (existingStat) {
			throw new BadRequestException("Stat of this month already exists");
		}

		return await this.prismaService.performanceStat.create({
			data: {
				owner: {
					connect: {
						id: ownerId,
					},
				},
				month: monthISOString,
				statSections: {
					create: statSections,
				},
			},
			include: {
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
	}

	async getAll() {
		return await this.prismaService.performanceStat.findMany({
			include: {
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
	}

	async getStatById(id: number) {
		return await this.prismaService.performanceStat.findUnique({
			where: {
				id: id,
			},
			include: {
				owner: true,
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
	}

	async searchStats(@Body() searchStatDto: SearchStatDto) {
		const { ownerId, year } = searchStatDto;
		const startDate = dayjs(year).startOf("year").toDate();
		const endDate = dayjs(year).endOf("year").toDate();
		return await this.prismaService.performanceStat.findMany({
			where: {
				ownerId: ownerId,
				month: {
					gte: startDate,
					lte: endDate,
				},
			},
		});
	}

	async updateStatById(id: number, updateStatDto: UpdateStatDto) {
		const { ownerId, month, statSections: requestSections } = updateStatDto;

		/* check weight sum */
		const weightSum = requestSections.reduce(
			(acc, curr) => acc + curr.weight,
			0
		);
		if (weightSum !== 100) {
			throw new BadRequestException("Weight sum must be 100");
		}

		const dbStat = await this.prismaService.performanceStat.findUnique({
			where: {
				id: id,
			},
			include: {
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
		if (!dbStat) {
			throw new NotFoundException("Stat not found");
		}

		/* request sections have 'id' property */
		const requestSectionIds = requestSections
			.filter((s) => {
				return s.id ? true : false;
			})
			.map((s) => s.id);

		const dbSections = dbStat.statSections;
		const dbSectionsToDelete = dbSections.filter(
			(sec) => !requestSectionIds.includes(sec.id)
		);
		const dbSectionsToUpdate = dbSections.filter((sec) =>
			requestSectionIds.includes(sec.id)
		);
		/* if section doesn't have 'id' property, it's a new section */
		const sectionsToCreate = requestSections.filter((s) => !s.id);

		/* delete related events */
		for (const section of dbSectionsToDelete) {
			/* delete event attachments */
			const eventIds = section.events.map((e) => e.id);
			for (const id of eventIds) {
				await rm(
					`./storage/internal/apps/performances/event-attachments/${id}`,
					{
						recursive: true,
						force: true,
					}
				);
			}
			/* delete events */
			await this.prismaService.event.deleteMany({
				where: {
					sectionId: section.id,
				},
			});
		}
		/* delete sections */
		await this.prismaService.statSection.deleteMany({
			where: {
				id: {
					in: dbSectionsToDelete.map((s) => s.id),
				},
			},
		});

		/* update existing sections */
		for (const sec of dbSectionsToUpdate) {
			/* request sections for update */
			const requestSectionForUpdate = requestSections.find(
				(s) => s.id === sec.id
			);
			await this.prismaService.statSection.update({
				where: {
					id: sec.id,
				},
				data: {
					weight: requestSectionForUpdate!.weight,
					title: requestSectionForUpdate!.title,
					description:
						requestSectionForUpdate?.description ?? Prisma.skip,
				},
			});
		}

		/* create new sections */
		await this.prismaService.statSection.createMany({
			data: sectionsToCreate.map((s) => {
				return {
					weight: s.weight,
					title: s.title,
					description: s.description,
					statId: id,
				};
			}),
		});

		const newStat = await this.prismaService.performanceStat.findUnique({
			where: {
				id: id,
			},
			include: {
				owner: true,
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
		return newStat;
	}

	async remove(id: number) {
		const stat = await this.prismaService.performanceStat.findUnique({
			where: {
				id: id,
			},
			include: {
				statSections: {
					include: {
						events: true,
					},
				},
			},
		});
		if (!stat) {
			throw new NotFoundException("Stat not found");
		}
		for (const section of stat.statSections) {
			/* delete event attachments */
			const eventIds = section.events.map((e) => e.id);
			for (const id of eventIds) {
				await rm(
					`./storage/internal/apps/performances/event-attachments/${id}`,
					{
						recursive: true,
						force: true,
					}
				);
			}
			/* delete events */
			await this.prismaService.event.deleteMany({
				where: {
					sectionId: section.id,
				},
			});
		}
		/* delete sections */
		await this.prismaService.statSection.deleteMany({
			where: {
				statId: id,
			},
		});
		return await this.prismaService.performanceStat.delete({
			where: {
				id: id,
			},
		});
	}
}
