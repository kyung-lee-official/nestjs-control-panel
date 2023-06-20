import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Ip,
	UseGuards,
	Headers,
} from "@nestjs/common";
import { ChituboxManualFeedbacksService } from "./chitubox-manual-feedbacks.service";
import { CreateChituboxManualFeedbackDto } from "./dto/create-chitubox-manual-feedback.dto";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { FindChituboxManualFeedbackDto } from "./dto/find-chitubox-manual-feedback.dto";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller("chitubox-manual-feedbacks")
export class ChituboxManualFeedbacksController {
	constructor(
		private readonly chituboxManualFeedbacksService: ChituboxManualFeedbacksService
	) {}

	@Post()
	create(
		@Body()
		createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto,
		@Headers() headers: any
	): Promise<ChituboxManualFeedback> {
		return this.chituboxManualFeedbacksService.create(
			createChituboxManualFeedbackDto,
			headers
		);
	}

	@UseGuards(PermissionsGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.FIND_CHITUBOX_MANUAL_FEEDBACKS)
	@Get()
	find(
		@Body() findChituboxManualFeedbackDto: FindChituboxManualFeedbackDto
	): Promise<ChituboxManualFeedback[]> {
		return this.chituboxManualFeedbacksService.find(
			findChituboxManualFeedbackDto
		);
	}

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	// 	return this.chituboxManualFeedbacksService.findOne(+id);
	// }

	// @Delete(':id')
	// remove(@Param('id') id: string) {
	// 	return this.chituboxManualFeedbacksService.remove(+id);
	// }
}
