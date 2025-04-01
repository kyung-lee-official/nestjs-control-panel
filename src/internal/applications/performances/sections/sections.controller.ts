import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
} from "@nestjs/common";
import { SectionsService } from "./sections.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import {
	CreateSectionDto,
	createSectionDtoSchema,
} from "./dto/create-section.dto";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import {
	createSectionApiBodyOptions,
	createSectionApiOperationOptions,
} from "./swagger/create-section.swagger";
import { CreateSectionGuard } from "./guards/create-section.guard";
import { GetSectionGuard } from "./guards/get-section.guard";

@ApiTags("Performance Sections")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("/internal/performance/sections")
export class SectionsController {
	constructor(private readonly sectionsService: SectionsService) {}

	@ApiOperation(createSectionApiOperationOptions)
	@ApiBody(createSectionApiBodyOptions)
	@UseGuards(CreateSectionGuard)
	@Post()
	async create(
		@Body(new ZodValidationPipe(createSectionDtoSchema))
		createStatDto: CreateSectionDto
	) {
		return await this.sectionsService.create(createStatDto);
	}

	@UseGuards(GetSectionGuard)
	@Get(":sectionId")
	async getSectionById(
		@Param("sectionId", ParseIntPipe)
		sectionId: number
	) {
		return await this.sectionsService.getSectionById(sectionId);
	}
}
