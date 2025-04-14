import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ProgressTrackingGateway } from "./progress-tracking.gateway";
import { PrismaService } from "src/prisma/prisma.service";

@Processor("import-retail-sales-data")
export class ImportRetailSalesDataWorkerService extends WorkerHost {
	constructor(
		private readonly progressTrackingGateway: ProgressTrackingGateway,
		private readonly prismaService: PrismaService
	) {
		/* inject the gateway */
		super();
	}

	async process(job: Job<any>) {
		const { id, data } = job;
		const { meta, payload } = data;
		const { batchId, currenJobIndex, totalJobs } = meta;

		/* inject batchId into the payload */
		for (const data of payload) {
			data.batchId = batchId;
		}

		try {
			const result = await this.prismaService.retailSalesData.createMany({
				data: payload,
			});
		} catch (error) {
			console.error(error);
		}

		this.progressTrackingGateway.sendProgress({
			progress: (currenJobIndex / totalJobs) * 100,
		});
		return { success: true };
	}

	@OnWorkerEvent("completed")
	onCompleted(job: Job<any>) {
		const { id, data } = job;
		const { meta, payload } = data;
		/* disconnect if all jobs are done */
		if (meta.currenJobIndex === meta.totalJobs) {
			this.progressTrackingGateway.disconnect();
		}
	}
}
