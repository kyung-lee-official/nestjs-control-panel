import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UsePipes,
	ParseIntPipe,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto, createEventDtoSchema } from "./dto/create-event.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	createEventApiBodyOptions,
	createEventApiOperationOptions,
} from "./swagger/create-event.swagger";
import { CreateEventGuard } from "./guards/create-event.guard";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { UpdateEventDto } from "./dto/update-event.dto";

@ApiTags("Events")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("performance/events")
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@ApiOperation(createEventApiOperationOptions)
	@ApiBody(createEventApiBodyOptions)
	@UseGuards(CreateEventGuard)
	@UsePipes(new ZodValidationPipe(createEventDtoSchema))
	@Post()
	async create(@Body() createEventDto: CreateEventDto) {
		return await this.eventsService.create(createEventDto);
	}

	@Get()
	async findAll() {
		return this.eventsService.findAll();
	}

	@Get(":id")
	async findEventById(@Param("id", ParseIntPipe) id: number) {
		return await this.eventsService.findEventById(id);
	}

	@Patch("update-event-by-id/:id")
	async updateEventById(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateEventDto: UpdateEventDto
	) {
		return await this.eventsService.updateEventById(id, updateEventDto);
	}

	@Delete(":id")
	async remove(@Param("id", ParseIntPipe) id: number) {
		return await this.eventsService.remove(id);
	}
}
