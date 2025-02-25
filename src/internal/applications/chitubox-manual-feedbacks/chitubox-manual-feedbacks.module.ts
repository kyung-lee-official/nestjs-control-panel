import { Module } from "@nestjs/common";
import { ChituboxManualFeedbacksService } from "./chitubox-manual-feedbacks.service";
import { ChituboxManualFeedbacksController } from "./chitubox-manual-feedbacks.controller";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";

@Module({
	imports: [ConfigModule.forRoot(), PrismaModule],
	controllers: [ChituboxManualFeedbacksController],
	providers: [ChituboxManualFeedbacksService],
})
export class ChituboxManualFeedbacksModule {}
