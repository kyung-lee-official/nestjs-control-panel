import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { rm } from "fs/promises";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";
import { REQUEST } from "@nestjs/core";
import { CheckResourceRequest } from "@cerbos/core";
import { UpdateSectionDto } from "./dto/update-section.dto";

@Injectable()
export class SectionsService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions(sectionId: number) {
		const { requester } = this.request;
		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = [
			"*",
			"create",
			"create-event",
			"read",
			"update",
			"delete",
		];

		const section = await this.prismaService.statSection.findUnique({
			where: {
				id: sectionId,
			},
			include: {
				memberRole: true,
				stat: {
					include: {
						owner: {
							include: {
								memberRoles: true,
							},
						},
					},
				},
			},
		});
		if (!section) {
			throw new Error("Section not found");
		}
		const statOwnerSuperRoleIds =
			await this.utilsService.getSuperRolesOfRoles(
				section.stat.owner.memberRoles.map((role) => role.id)
			);
		const sectionSuperRoleIds = await this.utilsService.getSuperRoles(
			section.memberRole.id
		);
		const statOwnerId = section.stat.owner.id;
		const resource = {
			kind: "internal:applications:performances:section",
			id: sectionId.toString(),
			attr: {
				statOwnerSuperRoleIds: statOwnerSuperRoleIds,
				sectionSuperRoleIds: sectionSuperRoleIds,
				statOwnerId: statOwnerId,
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

	async updateSectionById(updateSectionDto: UpdateSectionDto) {
		const { sectionId, weight, title, description } = updateSectionDto;
		const section = await this.prismaService.statSection.update({
			where: {
				id: sectionId,
			},
			data: {
				weight: weight,
				title: title,
				description: description,
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
