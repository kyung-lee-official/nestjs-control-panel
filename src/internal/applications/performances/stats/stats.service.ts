import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateStatDto } from "./dto/create-stat.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { rm } from "fs/promises";
import { SearchStatDto } from "./dto/search-stat.dto";
import dayjs from "dayjs";
import { REQUEST } from "@nestjs/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";
import { CheckResourceRequest, Resource } from "@cerbos/core";

@Injectable()
export class StatsService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions(statId: number) {
		const { requester } = this.request;
		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*", "create", "create-section", "read", "delete"];

		const stat = await this.prismaService.performanceStat.findUnique({
			where: {
				id: statId,
			},
			include: {
				owner: {
					include: {
						memberRoles: true,
					},
				},
			},
		});
		if (!stat) {
			throw new Error("Stat not found");
		}
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(
				stat.owner.memberRoles.map((role) => role.id)
			);

		const statOwnerId = stat.owner.id;
		const resource: Resource = {
			kind: "internal:applications:performances:stat",
			id: statId.toString(),
			attr: {
				statOwnerId: statOwnerId,
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
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

	async create(createStatDto: CreateStatDto) {
		const { ownerId, month } = createStatDto;
		const monthISOString = dayjs(month).startOf("month").toISOString();

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
						memberRole: true,
						events: true,
					},
				},
			},
		});
	}

	async searchStats(searchStatDto: SearchStatDto) {
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

	async remove(id: number) {
		await this.prismaService.$transaction(async (tx) => {
			const stat = await tx.performanceStat.findUnique({
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
				/* delete event comments */
				await tx.eventComment.deleteMany({
					where: {
						eventId: id,
					},
				});
				/* delete events */
				await tx.event.deleteMany({
					where: {
						sectionId: section.id,
					},
				});
			}
			/* delete sections */
			await tx.statSection.deleteMany({
				where: {
					statId: id,
				},
			});
			/* delete stat */
			return await tx.performanceStat.delete({
				where: {
					id: id,
				},
			});
		});
	}
}
