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
import { SearchStatDto, searchStatDtoSchema } from "./dto/search-stat.dto";
import { CreateStatGuard } from "./guards/create-stat.guard";
import { DeleteStatGuard } from "./guards/delete-stat.guard";
import { UpdateStatGuard } from "./guards/update-stat.guard";
import { GetStatGuard } from "./guards/get-stat.guard";
import { SearchStatGuard } from "./guards/search-stat.guard";
import {
	searchStatApiBodyOptions,
	searchStatApiOperationOptions,
} from "./swagger/search-stat.swagger";
import { GetAllStatsGuard } from "./guards/get-all-stats.guard";

@ApiTags("Performance Stats")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("performance/stats")
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@ApiOperation(createStatApiOperationOptions)
	@ApiBody(createStatApiBodyOptions)
	@UseGuards(CreateStatGuard)
	@UsePipes(new ZodValidationPipe(createStatDtoSchema))
	@Post()
	async create(@Body() createStatDto: CreateStatDto) {
		return await this.statsService.create(createStatDto);
	}

	@ApiOperation({ summary: "Get all performance stats, 'admin' only" })
	@UseGuards(GetAllStatsGuard)
	@Get()
	async getAll() {
		return await this.statsService.getAll();
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(GetStatGuard)
	@Get(":id")
	async getStatById(@Param("id", ParseIntPipe) id: number) {
		return this.statsService.getStatById(id);
	}

	@ApiOperation(searchStatApiOperationOptions)
	@ApiBody(searchStatApiBodyOptions)
	@UseGuards(SearchStatGuard)
	@Post("search")
	async searchStats(
		@Body(new ZodValidationPipe(searchStatDtoSchema))
		searchStatDto: SearchStatDto
	) {
		return await this.statsService.searchStats(searchStatDto);
	}

	@ApiBody(updateStatApiBodyOptions)
	@UseGuards(UpdateStatGuard)
	@Patch(":id")
	async updateStatById(
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(updateStatDtoSchema))
		updateStatDto: UpdateStatDto
	) {
		return await this.statsService.updateStatById(id, updateStatDto);
	}

	@ApiOperation({ summary: "Delete a performance stat" })
	@UseGuards(DeleteStatGuard)
	@Delete(":id")
	async remove(@Param("id", ParseIntPipe) id: number) {
		return await this.statsService.remove(id);
	}
}
