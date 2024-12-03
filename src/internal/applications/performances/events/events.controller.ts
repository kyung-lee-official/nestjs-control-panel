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
	create(@Body() createEventDto: CreateEventDto) {
		return this.eventsService.create(createEventDto);
	}

	@Get()
	findAll() {
		return this.eventsService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.eventsService.findOne(+id);
	}

	// @Patch(":id")
	// update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto) {
	// 	return this.eventsService.update(+id, updateEventDto);
	// }

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.eventsService.remove(+id);
	}
}
