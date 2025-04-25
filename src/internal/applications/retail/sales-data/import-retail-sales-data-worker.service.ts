import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ProgressTrackingGateway } from "./progress-tracking.gateway";
import { PrismaService } from "src/prisma/prisma.service";
import { RetailSalesReqData } from "./dto/create-sales-data.dto";
import { Prisma } from "@prisma/client";

@Processor("import-retail-sales-data")
export class ImportRetailSalesDataWorkerService extends WorkerHost {
	constructor(
		private readonly progressTrackingGateway: ProgressTrackingGateway,
		private readonly prismaService: PrismaService
	) {
		/* inject the gateway */
		super();
	}

	async process(
		job: Job<{
			meta: {
				batchId: number;
				currenJobIndex: number;
				totalJobs: number;
			};
			payload: RetailSalesReqData[];
		}>
	) {
		const { id, data } = job;
		const { meta, payload } = data;
		const { batchId, currenJobIndex, totalJobs } = meta;

		await this.prismaService.$transaction(async (tx) => {
			for (const d of payload) {
				/* extract nullable fields */
				const { platformAddress, category, sourceAttribute } = d;
				await tx.retailSalesData.create({
					data: {
						retailSalesDataBatch: {
							connect: {
								id: batchId,
							},
						},
						date: d.date,
						receiptType: d.receiptType,
						client: d.client,
						department: d.department,
						product: {
							connectOrCreate: {
								where: { sku: d.sku },
								create: { sku: d.sku, nameZhCn: d.nameZhCn },
							},
						},
						salesVolume: d.salesVolume,
						platformAddress: platformAddress ?? null,
						platformOrderId: d.platformOrderId,
						storehouse: d.storehouse,
						category: category ?? null,
						sourceAttribute: sourceAttribute ?? null,
						taxInclusivePriceCny: d.taxInclusivePriceCny,
						priceCny: d.priceCny,
						unitPriceCny: d.unitPriceCny,
					},
				});
			}
		});

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
