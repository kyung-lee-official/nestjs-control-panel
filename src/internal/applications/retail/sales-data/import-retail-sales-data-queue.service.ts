import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class ImportRetailSalesDataQueueService {
	constructor(
		@InjectQueue("import-retail-sales-data")
		private readonly importRetailSalesDataQueue: Queue
	) {}

	async addJob(data) {
		const job = await this.importRetailSalesDataQueue.add(
			"import-retail-sales-data-job",
			data,
			{
				/**
				 * the auto removal of jobs works lazily.
				 * this means that jobs are not removed unless a new job completes or fails,
				 * since that is when the auto-removal takes place.
				 */
				removeOnComplete: {
					age: 15,
				},
				removeOnFail: true,
			}
		);
	}
}
