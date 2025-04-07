import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	ParseIntPipe,
	UseInterceptors,
	UseGuards,
} from "@nestjs/common";
import { StatsService } from "./stats.service";
import { CreateStatDto, createStatDtoSchema } from "./dto/create-stat.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createStatApiBodyOptions,
	createStatApiOperationOptions,
} from "./swagger/create-stat.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { ExcludePasswordInterceptor } from "src/interceptors/exclude-password.interceptor";

import { SearchStatDto, searchStatDtoSchema } from "./dto/search-stat.dto";
import { CreateStatGuard } from "./guards/create-stat.guard";
import { DeleteStatGuard } from "./guards/delete-stat.guard";
import { GetStatGuard } from "./guards/get-stat.guard";
import { SearchStatGuard } from "./guards/search-stat.guard";
import {
	searchStatApiBodyOptions,
	searchStatApiOperationOptions,
} from "./swagger/search-stat.swagger";

@ApiTags("Performance Stats")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/performance/stats")
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@ApiOperation({ summary: "Get my permissions of a specific stat" })
	@Get("permissions/:statId")
	async permissions(
		@Param("statId", ParseIntPipe)
		statId: number
	) {
		return await this.statsService.permissions(statId);
	}

	@ApiOperation(createStatApiOperationOptions)
	@ApiBody(createStatApiBodyOptions)
	@UseGuards(CreateStatGuard)
	@Post()
	async create(
		@Body(new ZodValidationPipe(createStatDtoSchema))
		createStatDto: CreateStatDto
	) {
		return await this.statsService.create(createStatDto);
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

	@ApiOperation({ summary: "Delete a performance stat" })
	@UseGuards(DeleteStatGuard)
	@Delete(":id")
	async remove(@Param("id", ParseIntPipe) id: number) {
		return await this.statsService.remove(id);
	}
}
