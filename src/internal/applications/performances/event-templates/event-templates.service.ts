import { Injectable } from "@nestjs/common";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { UpdateEventTemplateDto } from "./dto/update-event-template.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EventTemplatesService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createEventTemplateDto: CreateEventTemplateDto) {
		return await this.prismaService.eventTemplate.create({
			data: createEventTemplateDto,
		});
	}

	async findAll() {
		return await this.prismaService.eventTemplate.findMany();
	}

	findOne(id: number) {
		return `This action returns a #${id} eventTemplate`;
	}

	update(id: number, updateEventTemplateDto: UpdateEventTemplateDto) {
		return `This action updates a #${id} eventTemplate`;
	}

	remove(id: number) {
		return `This action removes a #${id} eventTemplate`;
	}
}
