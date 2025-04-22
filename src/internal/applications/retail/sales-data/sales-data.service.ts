import { BadRequestException, Injectable } from "@nestjs/common";
import { ImportRetailSalesDataQueueService } from "./import-retail-sales-data-queue.service";
import { PrismaService } from "src/prisma/prisma.service";
import * as zlib from "zlib";
import {
	RetailSalesReqData,
	retailSalesReqDataArraySchema,
} from "./dto/create-sales-data.dto";
import { FilterSalesDataDto, Sku } from "./dto/filter-sales-date.dto";

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
			const parsedData: RetailSalesReqData[] = JSON.parse(
				decompressedData.toString("utf-8")
			);

			/* validate JSON data */
			retailSalesReqDataArraySchema.parse(parsedData);

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
				where: { batchId: batchId },
			});
			/* delete the batch */
			await tx.retailSalesDataBatch.delete({
				where: { id: batchId },
			});
			/* delete associated skus (products) */
			const allSkus = await tx.retailSalesDataProduct.findMany();
			for (const sku of allSkus) {
				const retailSalesData = await tx.retailSalesData.findFirst({
					where: { productId: sku.id },
				});
				if (!retailSalesData) {
					await tx.retailSalesDataProduct.delete({
						where: { id: sku.id },
					});
				}
			}
		});
		return { success: true };
	}

	async getClients() {
		const clients =
			await this.prismaService.retailSalesDataClient.findMany();
		return clients;
	}

	async getStorehouses() {
		const storehouses =
			await this.prismaService.retailSalesDataStorehouse.findMany();
		return storehouses;
	}

	async getCategories() {
		const categories =
			await this.prismaService.retailSalesDataCategory.findMany();
		return categories;
	}

	async getReceiptTypes() {
		const receiptTypes =
			await this.prismaService.retailSalesDataReceiptType.findMany();
		return receiptTypes;
	}

	async getSourceAttributes() {
		const sourceAttributes =
			await this.prismaService.retailSalesDataSourceAttribute.findMany();
		return sourceAttributes;
	}

	async searchSku(term: string) {
		const sku = await this.prismaService.retailSalesDataProduct.findMany({
			where: {
				OR: [
					{ sku: { contains: term, mode: "insensitive" } },
					{ nameZhCn: { contains: term, mode: "insensitive" } },
				],
			},
			take: 20,
		});
		return sku;
	}

	async filterSalesData(filterSalesDataDto: FilterSalesDataDto) {
		const { dateMode, ...rest } = filterSalesDataDto;
		switch (dateMode) {
			case "range":
				const { start, end } = filterSalesDataDto.dateRange;
				const data = await this.prismaService.retailSalesData.findMany({
					where: {
						date: {
							gte: start,
							lte: end,
						},
						client: {
							client: {
								in: filterSalesDataDto.clients,
							},
						},
						storehouse: {
							storehouse: {
								in: filterSalesDataDto.storehouses,
							},
						},
						category: {
							category: {
								in: filterSalesDataDto.categories,
							},
						},
						product: {
							sku: {
								in: (filterSalesDataDto.skus as Sku[]).map(
									(sku) => sku.sku
								),
							},
						},
						// receiptType: {
						// 	receiptType: {
						// 		in: filterSalesDataDto.receiptTypes,
						// 	},
						// },
					},
					include: {
						receiptType: true,
						client: true,
						// department: true,
						product: true,
						storehouse: true,
						category: true,
						sourceAttribute: true,
					},
				});
				const mappedData = data.map((item) => {
					return {
						...item,
						id: item.id.toString(),
					};
				});
				return mappedData;
			case "month":
				const { months } = filterSalesDataDto;
				const filteredSalesData: any[] = [];
				for (const m of months) {
					const salesData =
						await this.prismaService.retailSalesData.findMany({
							where: {
								date: {
									gte: new Date(
										new Date().getFullYear(),
										m,
										1
									),
									lte: new Date(
										new Date().getFullYear(),
										m + 1,
										0
									),
								},
								// ...rest,
							},
						});
					filteredSalesData.push({
						...salesData,
						data: salesData.map((item) => ({
							...item,
							id: item.id.toString(),
						})),
					});
				}
			default:
				throw new BadRequestException("Invalid date mode");
		}
	}

	chunkifyArray<T>(array: T[], chunkSize: number): T[][] {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			result.push(array.slice(i, i + chunkSize));
		}
		return result;
	}
}
