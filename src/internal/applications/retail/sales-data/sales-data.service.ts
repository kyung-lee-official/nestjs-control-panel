import { BadRequestException, Injectable } from "@nestjs/common";
import { ImportRetailSalesDataQueueService } from "./import-retail-sales-data-queue.service";
import { PrismaService } from "src/prisma/prisma.service";
import * as zlib from "zlib";
import {
	RetailSalesReqData,
	retailSalesReqDataArraySchema,
} from "./dto/create-sales-data.dto";
import { FilterSalesDataDto, Sku } from "./dto/filter-sales-date.dto";
import { Prisma } from "@prisma/client";

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
						client: filterSalesDataDto.clients.length
							? {
									in: filterSalesDataDto.clients,
								}
							: Prisma.skip,
						storehouse: filterSalesDataDto.storehouses.length
							? {
									in: filterSalesDataDto.storehouses,
								}
							: Prisma.skip,
						category: filterSalesDataDto.categories.length
							? {
									in: filterSalesDataDto.categories,
								}
							: Prisma.skip,
						product: (filterSalesDataDto.skus as Sku[]).length
							? {
									sku: {
										in: (
											filterSalesDataDto.skus as Sku[]
										).map((sku) => sku.sku),
									},
								}
							: Prisma.skip,
						receiptType: filterSalesDataDto.receiptTypes.length
							? {
									in: filterSalesDataDto.receiptTypes,
								}
							: Prisma.skip,
						sourceAttribute: filterSalesDataDto.sourceAttributes
							.length
							? {
									in: filterSalesDataDto.sourceAttributes,
								}
							: Prisma.skip,
					},
					include: {
						product: true,
					},
				});
				const mappedData = data.map((item) => {
					return {
						...item,
						id: item.id.toString(),
					};
				});

				/* clients */
				const availableClients = [
					...new Set(mappedData.map((d) => d.client)),
				];
				const dbClients =
					await this.prismaService.retailSalesData.findMany({
						where: {},
						distinct: ["client"],
						select: { client: true },
					});
				const allClients = dbClients.map((c) => c.client);
				/* storehouses */
				const availableStorehouses = [
					...new Set(mappedData.map((d) => d.storehouse)),
				];
				const dbStorehousesRes =
					await this.prismaService.retailSalesData.findMany({
						where: {},
						distinct: ["storehouse"],
						select: { storehouse: true },
					});
				const allStorehouses = dbStorehousesRes.map(
					(s) => s.storehouse
				);
				/* categories */
				const availableCategories = [
					...new Set(mappedData.map((d) => d.category)),
				];
				const dbCategories =
					await this.prismaService.retailSalesData.findMany({
						where: {},
						distinct: ["category"],
						select: { category: true },
					});
				const allCategories = dbCategories.map((c) => c.category);
				/* receipt types */
				const availableReceiptTypes = [
					...new Set(mappedData.map((d) => d.receiptType)),
				];
				const dbReceiptTypes =
					await this.prismaService.retailSalesData.findMany({
						where: {},
						distinct: ["receiptType"],
						select: { receiptType: true },
					});
				const allReceiptTypes = dbReceiptTypes.map(
					(r) => r.receiptType
				);
				/* source attributes */
				const availableSourceAttributes = [
					...new Set(mappedData.map((d) => d.sourceAttribute)),
				];
				const dbSourceAttributes =
					await this.prismaService.retailSalesData.findMany({
						where: {},
						distinct: ["sourceAttribute"],
						select: { sourceAttribute: true },
					});
				const allSourceAttributes = dbSourceAttributes.map(
					(s) => s.sourceAttribute
				);

				return {
					retailSalesData: mappedData,
					clients: {
						availableClients,
						allClients,
					},
					storehouses: {
						availableStorehouses,
						allStorehouses,
					},
					categories: {
						availableCategories,
						allCategories,
					},
					receiptTypes: {
						availableReceiptTypes,
						allReceiptTypes,
					},
					sourceAttributes: {
						availableSourceAttributes,
						allSourceAttributes,
					},
				};
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
