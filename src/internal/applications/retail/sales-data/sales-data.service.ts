import { BadRequestException, Injectable } from "@nestjs/common";
import { ImportRetailSalesDataQueueService } from "./import-retail-sales-data-queue.service";
import { PrismaService } from "src/prisma/prisma.service";
import * as zlib from "zlib";
import { retailSalesDataDtoSchema } from "./dto/create-sales-data.dto";

@Injectable()
export class SalesDataService {
	constructor(
		private readonly importRetailSalesDataQueueService: ImportRetailSalesDataQueueService,
		private readonly prismaService: PrismaService
	) {}

	async import(data: Express.Multer.File) {
		if (!data) {
			throw new BadRequestException("No data uploaded");
		}

		try {
			/* convert binary data to JSON */
			const decompressedData = zlib.gunzipSync(data.buffer);
			const parsedData = JSON.parse(decompressedData.toString("utf-8"));

			/* validate JSON data */
			retailSalesDataDtoSchema.parse(parsedData);

			/* create batch */
			const batch = await this.prismaService.retailSalesDataBatch.create(
				{}
			);

			const chunkifiedData = this.chunkifyArray(parsedData, 10);
			for (const [i, chunk] of chunkifiedData.entries()) {
				await this.importRetailSalesDataQueueService.addJob({
					meta: {
						batchId: batch.id,
						currenJobIndex: i + 1,
						totalJobs: chunkifiedData.length,
					},
					payload: chunk,
				});
			}
			return { success: true };
		} catch (error) {
			console.error(error);
			throw new BadRequestException(
				"an error occurred while either parsing or validating the data"
			);
		}
	}

	async getBatches(pageId: number) {
		const pageSize = 20;
		if (pageId < 0) {
			throw new BadRequestException("Invalid page ID");
		}

		const batches = await this.prismaService.retailSalesDataBatch.findMany({
			skip: (pageId - 1) * pageSize,
			take: pageSize,
			orderBy: { createdAt: "desc" },
			include: {
				_count: {
					select: { retailSalesData: true },
				},
			},
		});
		return batches;
	}

	async delete(batchId: number) {
		await this.prismaService.$transaction(async (tx) => {
			/* delete all sales data for the batch */
			await tx.retailSalesData.deleteMany({
				where: { batchId },
			});
			/* delete the batch */
			await tx.retailSalesDataBatch.delete({
				where: { id: batchId },
			});
		});
		return { success: true };
	}

	chunkifyArray<T>(array: T[], chunkSize: number): T[][] {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			result.push(array.slice(i, i + chunkSize));
		}
		return result;
	}
}
