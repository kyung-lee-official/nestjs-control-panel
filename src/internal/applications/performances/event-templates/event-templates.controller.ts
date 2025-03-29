import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import {
	CreateEventTemplateDto,
	createEventTemplateDtoSchema,
} from "./dto/create-event-template.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createEventTemplateApiBodyOptions,
	createEventTemplateApiOperationOptions,
} from "./swagger/create-event-template.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { CreateTemplateGuard } from "./guards/create-template.guard";
import { GetTemplatesByRoleIdGuard } from "./guards/get-templates-by-role-id.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { DeleteTemplateGuard } from "./guards/delete-template.guard";
import { GetTemplateByIdGuard } from "./guards/get-template-by-id.guard";

@ApiTags("Performance Event Template")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("performance/event-templates")
export class EventTemplatesController {
	constructor(
		private readonly eventTemplatesService: EventTemplatesService
	) {}

	@ApiOperation(createEventTemplateApiOperationOptions)
	@ApiBody(createEventTemplateApiBodyOptions)
	@UseGuards(CreateTemplateGuard)
	@Post()
	async create(
		@Body(new ZodValidationPipe(createEventTemplateDtoSchema))
		createEventTemplateDto: CreateEventTemplateDto
	) {
		return await this.eventTemplatesService.create(createEventTemplateDto);
	}

	@UseGuards(GetTemplateByIdGuard)
	@Get("get-by-id/:id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		return await this.eventTemplatesService.getById(id);
	}

	@UseGuards(GetTemplatesByRoleIdGuard)
	@Get("get-by-role-id/:roleId")
	async getByRoleId(@Param("roleId") roleId: string) {
		return await this.eventTemplatesService.getByRoleId(roleId);
	}

	// @Patch(":id")
	// update(
	// 	@Param("id") id: string,
	// 	@Body() updateEventTemplateDto: UpdateEventTemplateDto
	// ) {
	// 	return this.eventTemplatesService.update(+id, updateEventTemplateDto);
	// }

	@UseGuards(DeleteTemplateGuard)
	@Delete(":id")
	async deleteById(@Param("id", ParseIntPipe) id: number) {
		return await this.eventTemplatesService.deleteById(id);
	}
}
