import { Module } from '@nestjs/common';
import { ChituboxManualFeedbacksService } from './chitubox-manual-feedbacks.service';
import { ChituboxManualFeedbacksController } from './chitubox-manual-feedbacks.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { PermissionsModule } from "src/permissions/permissions.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([ChituboxManualFeedback]),
		PermissionsModule,
	],
	controllers: [ChituboxManualFeedbacksController],
	providers: [ChituboxManualFeedbacksService]
})
export class ChituboxManualFeedbacksModule { }
