import { Module } from "@nestjs/common";
import { SalesDataService } from "./sales-data.service";
import { SalesDataController } from "./sales-data.controller";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "src/prisma/prisma.module";
import { ImportRetailSalesDataQueueService } from "./import-retail-sales-data-queue.service";
import { ImportRetailSalesDataWorkerService } from "./import-retail-sales-data-worker.service";
import { ProgressTrackingGateway } from "./progress-tracking.gateway";

@Module({
	imports: [
		BullModule.registerQueue({
			name: "import-retail-sales-data",
		}),
		PrismaModule,
	],
	controllers: [SalesDataController],
	providers: [
		SalesDataService,
		ImportRetailSalesDataQueueService,
		ImportRetailSalesDataWorkerService,
		ProgressTrackingGateway,
	],
})
export class SalesDataModule {}
