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
	Put,
	UseInterceptors,
	UploadedFile,
	Res,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto, createEventDtoSchema } from "./dto/create-event.dto";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import {
	createEventApiBodyOptions,
	createEventApiOperationOptions,
} from "./swagger/create-event.swagger";
import { CreateEventGuard } from "./guards/create-event.guard";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { UpdateEventDto } from "./dto/update-event.dto";
import {
	updateEventAttachmentApiBodyOptions,
	updateEventAttachmentApiOperationOptions,
} from "./swagger/upload-event-attachment.swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	UpdateApprovalDto,
	updateApprovalDtoSchema,
} from "./dto/update-event-approval";
import {
	updateApprovalApiBodyOptions,
	updateApprovalApiOperationOptions,
} from "./swagger/update-event-approval.swagger";

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

	@ApiOperation(updateApprovalApiOperationOptions)
	@ApiBody(updateApprovalApiBodyOptions)
	@Patch("update-approval-by-event-id/:id")
	async updateApprovalByEventId(
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(updateApprovalDtoSchema))
		updateApprovalDto: UpdateApprovalDto
	) {
		return await this.eventsService.updateApprovalByEventId(
			id,
			updateApprovalDto
		);
	}

	@Get("get-attachment-list-by-event-id/:id")
	async getAttachmentListByEventId(@Param("id", ParseIntPipe) id: number) {
		return this.eventsService.getAttachmentListByEventId(id);
	}

	@Get("get-attachment/:id/:filename")
	async getAttachment(
		@Param("id", ParseIntPipe) id: number,
		@Param("filename") filename: string,
		@Res() res: any
	): Promise<any> {
		return await this.eventsService.getAttachment(id, filename, res);
	}

	@ApiOperation(updateEventAttachmentApiOperationOptions)
	@ApiConsumes("multipart/form-data")
	@ApiBody(updateEventAttachmentApiBodyOptions)
	@Put("upload-attachments-by-event-id/:id")
	@UseInterceptors(FileInterceptor("file"))
	async uploadEventAttachment(
		@Param("id", ParseIntPipe) id: number,
		@UploadedFile() file: Express.Multer.File
	): Promise<any> {
		return this.eventsService.uploadEventAttachment(id, file);
	}

	@Delete("delete-attachment/:id/:filename")
	async deleteAttachment(
		@Param("id", ParseIntPipe) id: number,
		@Param("filename") filename: string
	) {
		return await this.eventsService.deleteAttachment(id, filename);
	}
}
