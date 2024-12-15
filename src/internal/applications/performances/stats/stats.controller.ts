import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseInterceptors,
	UseGuards,
	UsePipes,
} from "@nestjs/common";
import { StatsService } from "./stats.service";
import { CreateStatDto, createStatDtoSchema } from "./dto/create-stat.dto";
import { UpdateStatDto, updateStatDtoSchema } from "./dto/update-stat.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createStatApiBodyOptions,
	createStatApiOperationOptions,
} from "./swagger/create-stat.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { ExcludePasswordInterceptor } from "src/interceptors/exclude-password.interceptor";
import { updateStatApiBodyOptions } from "./swagger/update-stat.swagger";

@ApiTags("Performance Stats")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("performance/stats")
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@ApiOperation(createStatApiOperationOptions)
	@ApiBody(createStatApiBodyOptions)
	@UsePipes(new ZodValidationPipe(createStatDtoSchema))
	@Post()
	async create(@Body() createStatDto: CreateStatDto) {
		return await this.statsService.create(createStatDto);
	}

	@Get()
	async findAll() {
		return await this.statsService.findAll();
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@Get(":id")
	async getStatById(@Param("id", ParseIntPipe) id: number) {
		return this.statsService.getStatById(id);
	}

	@ApiBody(updateStatApiBodyOptions)
	@Patch(":id")
	async updateStatById(
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(updateStatDtoSchema))
		updateStatDto: UpdateStatDto
	) {
		return await this.statsService.updateStatById(id, updateStatDto);
	}

	@ApiOperation({ summary: "Delete a performance stat" })
	@Delete(":id")
	async remove(@Param("id", ParseIntPipe) id: number) {
		return await this.statsService.remove(id);
	}
}
