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
import { StatsService } from "./stats.service";
import { CreateStatDto } from "./dto/create-stat.dto";
import { UpdateStatDto } from "./dto/update-stat.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createStatApiBodyOptions,
	createStatApiOperationOptions,
} from "./swagger/create-stat.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";

@ApiTags("Performance Stats")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("performance/stats")
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@ApiOperation(createStatApiOperationOptions)
	@ApiBody(createStatApiBodyOptions)
	@Post()
	create(@Body() createStatDto: CreateStatDto) {
		return this.statsService.create(createStatDto);
	}

	@Get()
	async findAll() {
		return await this.statsService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.statsService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateStatDto: UpdateStatDto) {
		return this.statsService.update(+id, updateStatDto);
	}

	@ApiOperation({ summary: "Delete a performance stat" })
	@Delete(":id")
	async remove(@Param("id", ParseIntPipe) id: number) {
		return await this.statsService.remove(id);
	}
}
