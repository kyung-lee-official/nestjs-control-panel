import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { PerformancesModule } from "./performances/performances.module";
import { FacebookGroupModule } from "./sns-crawler/facebook-group/facebook-group.module";
import { ChituboxManualFeedbacksModule } from "./chitubox-manual-feedbacks/chitubox-manual-feedbacks.module";
import { YoutubeDataCollectorModule } from "./sns-crawler/youtube-data-collector/youtube-data-collector.module";
import { RetailModule } from "./retail/retail.module";
import { BullModule } from "@nestjs/bullmq";

@Module({
	imports: [
		ChituboxManualFeedbacksModule,
		PerformancesModule,
		FacebookGroupModule,
		YoutubeDataCollectorModule,
		RetailModule,
		BullModule.forRoot({
			connection: {
				host: process.env.REDIS_HOST,
				port: Number(process.env.REDIS_PORT),
			},
		}),
	],
	controllers: [ApplicationsController],
	providers: [ApplicationsService],
})
export class ApplicationsModule {}
