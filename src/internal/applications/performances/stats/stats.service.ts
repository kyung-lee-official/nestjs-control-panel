import { Injectable } from "@nestjs/common";
import { CreateStatDto } from "./dto/create-stat.dto";
import { UpdateStatDto } from "./dto/update-stat.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class StatsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createStatDto: CreateStatDto) {
		return await this.prismaService.performanceStat.create({
			data: {
				...createStatDto,
				statSections: {
					create: {
						summary: "New Section",
						description: "",
					},
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

	async findAll() {
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

	findOne(id: number) {
		return `This action returns a #${id} stat`;
	}

	update(id: number, updateStatDto: UpdateStatDto) {
		return `This action updates a #${id} stat`;
	}

	async remove(id: number) {
		return await this.prismaService.performanceStat.delete({
			where: {
				id: id,
			},
		});
	}
}
