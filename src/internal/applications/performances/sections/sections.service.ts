import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";

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
}
