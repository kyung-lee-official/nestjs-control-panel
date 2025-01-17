import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import { CreateEventTemplateDto } from "./dto/create-event-template.dto";
import { UpdateEventTemplateDto } from "./dto/update-event-template.dto";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createEventTemplateApiBodyOptions,
	createEventTemplateApiOperationOptions,
} from "./swagger/create-event-template.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";

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

	@Get("get-by-role-id/:roleId")
	async getByRoleId(@Param("roleId") roleId: string) {
		return await this.eventTemplatesService.getByRoleId(roleId);
	}

	@UseGuards(JwtGuard)
	@Get("get-by-my-role-templates")
	async getMyRoleTemplates() {
		return await this.eventTemplatesService.getMyRoleTemplates();
	}

	@Get("get-by-id/:id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		return await this.eventTemplatesService.getById(id);
	}

	// @Patch(":id")
	// update(
	// 	@Param("id") id: string,
	// 	@Body() updateEventTemplateDto: UpdateEventTemplateDto
	// ) {
	// 	return this.eventTemplatesService.update(+id, updateEventTemplateDto);
	// }

	@Delete(":id")
	async deleteById(@Param("id", ParseIntPipe) id: number) {
		return await this.eventTemplatesService.deleteById(id);
	}
}
