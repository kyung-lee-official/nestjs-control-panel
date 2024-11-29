import { Injectable } from "@nestjs/common";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { UpdateEventTemplateDto } from "./dto/update-event-template.dto";

@Injectable()
export class EventTemplatesService {
	create(createEventTemplateDto: CreateEventTemplateDto) {
		return "This action adds a new eventTemplate";
	}

	findAll() {
		return `This action returns all eventTemplates`;
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
