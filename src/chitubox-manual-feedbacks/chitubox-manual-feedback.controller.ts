import { Controller, Get, Post, Body, Param, Delete, Ip } from '@nestjs/common';
import { ChituboxManualFeedbacksService } from './chitubox-manual-feedbacks.service';
import { CreateChituboxManualFeedbackDto } from './dto/create-chitubox-manual-feedback.dto';

@Controller('chitubox-manual-feedbacks')
export class ChituboxManualFeedbacksController {
	constructor(private readonly chituboxManualFeedbacksService: ChituboxManualFeedbacksService) { }

	@Post()
	create(
		@Body() createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto,
		@Ip() ip: string
	) {
		return this.chituboxManualFeedbacksService.create(createChituboxManualFeedbackDto, ip);
	}

	@Get()
	findAll() {
		return this.chituboxManualFeedbacksService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.chituboxManualFeedbacksService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.chituboxManualFeedbacksService.remove(+id);
	}
}
