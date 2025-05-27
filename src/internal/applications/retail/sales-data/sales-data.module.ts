import { Module } from "@nestjs/common";
import { SalesDataService } from "./sales-data.service";
import { SalesDataController } from "./sales-data.controller";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "src/prisma/prisma.module";
import { ImportRetailSalesDataQueueService } from "./import-retail-sales-data-queue.service";
import { ImportRetailSalesDataWorkerService } from "./import-retail-sales-data-worker.service";
import { RetailGatewayModule } from "../retail-gateway/retail-gateway.module";
import { CerbosModule } from "src/cerbos/cerbos.module";
import { UtilsModule } from "src/utils/utils.module";

@Module({
	imports: [
		BullModule.registerQueue({
			name: "import-retail-sales-data",
		}),
		PrismaModule,
		RetailGatewayModule,
		UtilsModule,
		CerbosModule,
	],
	controllers: [SalesDataController],
	providers: [
		SalesDataService,
		ImportRetailSalesDataQueueService,
		ImportRetailSalesDataWorkerService,
	],
})
export class SalesDataModule {}
