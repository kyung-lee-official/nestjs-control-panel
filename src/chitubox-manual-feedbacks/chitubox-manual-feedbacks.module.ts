import { Module } from '@nestjs/common';
import { ChituboxManualFeedbacksService } from './chitubox-manual-feedbacks.service';
import { ChituboxManualFeedbacksController } from './chitubox-manual-feedback.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([ChituboxManualFeedback]),
	],
	controllers: [ChituboxManualFeedbacksController],
	providers: [ChituboxManualFeedbacksService]
})
export class ChituboxManualFeedbacksModule { }
