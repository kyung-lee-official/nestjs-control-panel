import {
	Controller,
	Get,
	Post,
	Body,
	Delete,
	UseGuards,
	Headers,
	Query,
} from "@nestjs/common";
import { ChituboxManualFeedbacksService } from "./chitubox-manual-feedbacks.service";
import { CreateChituboxManualFeedbackDto } from "./dto/create-chitubox-manual-feedback.dto";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { Iso8601DateRangeDto } from "./dto/iso8601-date-range.dto";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";

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
	@UseGuards(IsVerifiedGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.FIND_CHITUBOX_MANUAL_FEEDBACKS)
	@Get()
	find(
		@Query()
		dateRangeDto: Iso8601DateRangeDto
	): Promise<ChituboxManualFeedback[]> {
		return this.chituboxManualFeedbacksService.find(dateRangeDto);
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
