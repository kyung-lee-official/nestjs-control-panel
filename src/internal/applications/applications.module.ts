import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { PerformancesModule } from "./performances/performances.module";
import { FacebookGroupModule } from "./sns-crawler/facebook-group/facebook-group.module";

@Module({
	controllers: [ApplicationsController],
	providers: [ApplicationsService],
	imports: [PerformancesModule, FacebookGroupModule],
})
export class ApplicationsModule {}
