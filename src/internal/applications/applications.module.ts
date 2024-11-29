import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { PerformancesModule } from './performances/performances.module';

@Module({
	controllers: [ApplicationsController],
	providers: [ApplicationsService],
	imports: [PerformancesModule],
})
export class ApplicationsModule {}
