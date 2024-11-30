import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { UpdateEventTemplateDto } from "./dto/update-event-template.dto";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createEventTemplateApiBodyOptions,
	createEventTemplateApiOperationOptions,
} from "./swagger/create-event-template.swagger";

@ApiTags("Performance Event Template")
@Controller("performance/event-templates")
export class EventTemplatesController {
	constructor(
		private readonly eventTemplatesService: EventTemplatesService
	) {}

	@ApiOperation(createEventTemplateApiOperationOptions)
	@ApiBody(createEventTemplateApiBodyOptions)
	@Post()
	async create(@Body() createEventTemplateDto: CreateEventTemplateDto) {
		return await this.eventTemplatesService.create(createEventTemplateDto);
	}

	@Get()
	findAll() {
		return this.eventTemplatesService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.eventTemplatesService.findOne(+id);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateEventTemplateDto: UpdateEventTemplateDto
	) {
		return this.eventTemplatesService.update(+id, updateEventTemplateDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.eventTemplatesService.remove(+id);
	}
}
