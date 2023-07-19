import { Module } from "@nestjs/common";
import { ChituboxManualFeedbacksService } from "./chitubox-manual-feedbacks.service";
import { ChituboxManualFeedbacksController } from "./chitubox-manual-feedbacks.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { ConfigModule } from "@nestjs/config";
import { User } from "src/users/entities/user.entity";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([ChituboxManualFeedback, User]),
		PermissionsModule,
	],
	controllers: [ChituboxManualFeedbacksController],
	providers: [ChituboxManualFeedbacksService],
})
export class ChituboxManualFeedbacksModule {}
