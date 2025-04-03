import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { UpdateEventDto } from "./dto/update-event.dto";
import { mkdir, readdir, rm, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { UpdateApprovalDto } from "./dto/update-event-approval";
import { UtilsService } from "src/utils/utils.service";
import { CheckResourceRequest } from "@cerbos/core";
import { CerbosService } from "src/cerbos/cerbos.service";

@Injectable()
export class EventsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
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
		await this.prismaService.$transaction(async (tx) => {
			/* delete event attachments */
			await rm(
				`./storage/internal/apps/performances/event-attachments/${id}`,
				{
					recursive: true,
					force: true,
				}
			);
			/* delete event comments */
			await tx.eventComment.deleteMany({
				where: {
					eventId: id,
				},
			});
			/* delete event */
			return await tx.event.delete({
				where: {
					id,
				},
			});
		});
	}

	async getApprovalPermissions(id: number) {
		const { requester } = this.request;
		const eventId = id;
		if (isNaN(eventId)) {
			throw new BadRequestException("Invalid event id");
		}
		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["update"];
		/* find event and section role */
		const performanceEvent = await this.prismaService.event.findUnique({
			where: {
				id: eventId,
			},
			include: {
				section: true,
			},
		});
		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const sectionRoleId = performanceEvent.section.memberRoleId;
		const sectionSuperRoleIds =
			await this.utilsService.getSuperRoles(sectionRoleId);

		if (!performanceEvent) {
			throw new NotFoundException("Performance event not found");
		}
		const resource = {
			kind: "internal:applications:performances:event:approval",
			id: "*",
			attr: {
				sectionSuperRoleIds: sectionSuperRoleIds,
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

	async updateApprovalByEventId(
		id: number,
		updateApprovalDto: UpdateApprovalDto
	) {
		const { approval } = updateApprovalDto;
		return await this.prismaService.event.update({
			where: {
				id,
			},
			data: {
				approval,
			},
		});
	}

	async getAttachmentListByEventId(id: number) {
		try {
			const items = await readdir(
				`./storage/internal/apps/performances/event-attachments/${id}`
			);
			const files: { name: string }[] = items.map((item) => {
				return {
					name: item,
				};
			});
			return files;
		} catch (error: any) {
			if (error.code === "ENOENT") {
				return [];
			} else {
				throw error;
			}
		}
	}

	async getAttachment(id: number, filename: string, res: any) {
		const image = `./storage/internal/apps/performances/event-attachments/${id}/${filename}`;
		res.download(image);
	}

	async uploadEventAttachment(
		id: number,
		file: Express.Multer.File
	): Promise<any> {
		/* save file to local, create folder if not exists */
		const folderPath = `./storage/internal/apps/performances/event-attachments/${id}`;
		const isExists = existsSync(folderPath);
		if (!isExists) {
			await mkdir(folderPath, { recursive: true });
		}
		const filename = Buffer.from(file.originalname, "latin1")
			.toString("utf8")
			.normalize("NFD");
		await writeFile(
			`./storage/internal/apps/performances/event-attachments/${id}/${filename}`,
			file.buffer
		);
		return { success: true };
	}

	async deleteAttachment(id: number, filename: string) {
		await unlink(
			`./storage/internal/apps/performances/event-attachments/${id}/${filename}`
		);
		return { success: true };
	}
}
