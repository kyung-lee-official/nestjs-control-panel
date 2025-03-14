import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { PerformancesModule } from "./performances/performances.module";
import { FacebookGroupModule } from "./sns-crawler/facebook-group/facebook-group.module";
import { ChituboxManualFeedbacksModule } from "./chitubox-manual-feedbacks/chitubox-manual-feedbacks.module";
import { YoutubeDataCollectorModule } from './sns-crawler/youtube-data-collector/youtube-data-collector.module';

@Module({
	controllers: [ApplicationsController],
	providers: [ApplicationsService],
	imports: [
		ChituboxManualFeedbacksModule,
		PerformancesModule,
		FacebookGroupModule,
		YoutubeDataCollectorModule,
	],
})
export class ApplicationsModule {}
