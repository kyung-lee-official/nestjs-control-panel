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

			const chunkifiedData = this.chunkifyArray(parsedData, 200);
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

	async getAllSkus() {
		const skus = await this.prismaService.retailSalesDataProduct.findMany();
		return skus;
	}

	async filterSalesData(filterSalesDataDto: FilterSalesDataDto) {
		const { dateMode, ...rest } = filterSalesDataDto;
		switch (dateMode) {
			case "range":
				const { start, end } = filterSalesDataDto.dateRange;

				/* findManyQuery: 5.452s */
				// console.time("findManyQuery");
				// const data = await this.prismaService.retailSalesData.findMany({
				// 	where: {
				// 		date: {
				// 			gte: start,
				// 			lte: end,
				// 		},
				// 		client: filterSalesDataDto.clients.length
				// 			? {
				// 					in: filterSalesDataDto.clients,
				// 				}
				// 			: Prisma.skip,
				// 		storehouse: filterSalesDataDto.storehouses.length
				// 			? {
				// 					in: filterSalesDataDto.storehouses,
				// 				}
				// 			: Prisma.skip,
				// 		category: filterSalesDataDto.categories.length
				// 			? {
				// 					in: filterSalesDataDto.categories,
				// 				}
				// 			: Prisma.skip,
				// 		product: (filterSalesDataDto.skus as Sku[]).length
				// 			? {
				// 					sku: {
				// 						in: (
				// 							filterSalesDataDto.skus as Sku[]
				// 						).map((sku) => sku.sku),
				// 					},
				// 				}
				// 			: Prisma.skip,
				// 		receiptType: filterSalesDataDto.receiptTypes.length
				// 			? {
				// 					in: filterSalesDataDto.receiptTypes,
				// 				}
				// 			: Prisma.skip,
				// 		sourceAttribute: filterSalesDataDto.sourceAttributes
				// 			.length
				// 			? {
				// 					in: filterSalesDataDto.sourceAttributes,
				// 				}
				// 			: Prisma.skip,
				// 	},
				// 	include: {
				// 		product: true,
				// 	},
				// });
				// console.timeEnd("findManyQuery");

				console.time("queryRaw"); /* 2.469s */
				const data = await this.prismaService.$queryRaw<
					{
						id: bigint;
						date: string;
						client: string;
						storehouse: string;
						category: string;
						receiptType: string;
						sourceAttribute: string;
						productId: number;
					}[]
				>(
					Prisma.sql`
					SELECT 
						CAST("retailSalesData"."id" AS TEXT) AS "id", -- convert id to string
						"retailSalesData".*,
						"product"."sku" AS "productSku",
						"product"."nameZhCn" AS "productNameZhCn"
					FROM 
						"RetailSalesData" AS "retailSalesData"
					LEFT JOIN 
						"RetailSalesDataProduct" AS "product"
					ON 
						"retailSalesData"."productId" = "product"."id"
					WHERE 
						"retailSalesData"."date" >= CAST(${start} AS timestamp without time zone) AND
						"retailSalesData"."date" <= CAST(${end} AS timestamp without time zone)
						${
							filterSalesDataDto.clients.length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesData" AS sub
							WHERE sub."client" = "retailSalesData"."client"
							AND sub."client" IN (${Prisma.join(filterSalesDataDto.clients)})
						)
						`
								: Prisma.empty
						}
						${
							filterSalesDataDto.storehouses.length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesData" AS sub
							WHERE sub."storehouse" = "retailSalesData"."storehouse"
							AND sub."storehouse" IN (${Prisma.join(filterSalesDataDto.storehouses)})
						)
						`
								: Prisma.empty
						}
						${
							filterSalesDataDto.categories.length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesData" AS sub
							WHERE sub."category" = "retailSalesData"."category"
							AND sub."category" IN (${Prisma.join(filterSalesDataDto.categories)})
						)
						`
								: Prisma.empty
						}
						${
							filterSalesDataDto.receiptTypes.length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesData" AS sub
							WHERE sub."receiptType" = "retailSalesData"."receiptType"
							AND sub."receiptType" IN (${Prisma.join(filterSalesDataDto.receiptTypes)})
						)
						`
								: Prisma.empty
						}
						${
							filterSalesDataDto.sourceAttributes.length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesData" AS sub
							WHERE sub."sourceAttribute" = "retailSalesData"."sourceAttribute"
							AND sub."sourceAttribute" IN (${Prisma.join(filterSalesDataDto.sourceAttributes)})
						)
						`
								: Prisma.empty
						}
						${
							(filterSalesDataDto.skus as Sku[]).length
								? Prisma.sql`
						AND EXISTS (
							SELECT 1
							FROM "RetailSalesDataProduct" AS sub
							WHERE sub."id" = "retailSalesData"."productId"
							AND sub."sku" IN (${Prisma.join(
								(filterSalesDataDto.skus as Sku[]).map(
									(sku) => sku.sku
								)
							)})
						)
						`
								: Prisma.empty
						}
					`
				);
				console.timeEnd("queryRaw");

				console.time("mapData"); /* 146.048ms */
				const mappedData = data.map((item) => {
					return {
						...item,
						id: item.id.toString(),
					};
				});
				console.timeEnd("mapData");

				console.time("columnQuery"); /* 367.966ms */
				const result = await this.prismaService.$queryRaw<
					{ column: string; value: string | null }[]
				>(Prisma.sql`
				SELECT 'client' AS column, "client" AS value FROM "RetailSalesData" GROUP BY "client"
				UNION ALL
				SELECT 'storehouse' AS column, "storehouse" AS value FROM "RetailSalesData" GROUP BY "storehouse"
				UNION ALL
				SELECT 'category' AS column, "category" AS value FROM "RetailSalesData" GROUP BY "category"
				UNION ALL
				SELECT 'receiptType' AS column, "receiptType" AS value FROM "RetailSalesData" GROUP BY "receiptType"
				UNION ALL
				SELECT 'sourceAttribute' AS column, "sourceAttribute" AS value FROM "RetailSalesData" GROUP BY "sourceAttribute"
				`);
				const allClients: string[] = [];
				const allStorehouses: string[] = [];
				const allCategories: string[] = [];
				const allReceiptTypes: string[] = [];
				const allSourceAttributes: string[] = [];
				for (const r of result) {
					if (r.column === "client" && r.value) {
						allClients.push(r.value);
					}
					if (r.column === "storehouse" && r.value) {
						allStorehouses.push(r.value);
					}
					if (r.column === "category" && r.value) {
						allCategories.push(r.value);
					}
					if (r.column === "receiptType" && r.value) {
						allReceiptTypes.push(r.value);
					}
					if (r.column === "sourceAttribute" && r.value) {
						allSourceAttributes.push(r.value);
					}
				}
				console.timeEnd("columnQuery");

				console.time("map set"); /* 30.577ms */
				const availableClients = [
					...new Set(mappedData.map((d) => d.client)),
				];
				/* storehouses */
				const availableStorehouses = [
					...new Set(mappedData.map((d) => d.storehouse)),
				];
				/* categories */
				const availableCategories = [
					...new Set(mappedData.map((d) => d.category)),
				];
				/* receipt types */
				const availableReceiptTypes = [
					...new Set(mappedData.map((d) => d.receiptType)),
				];
				/* source attributes */
				const availableSourceAttributes = [
					...new Set(mappedData.map((d) => d.sourceAttribute)),
				];
				console.timeEnd("map set");

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

	async performanceTest() {
		console.time("performanceTest");
		const data = await this.prismaService.$queryRaw(
			Prisma.sql`
			SELECT
				CAST("RetailSalesData"."id" AS TEXT) AS "id", -- convert id to string
				"RetailSalesData".*
			FROM
				"RetailSalesData"
			`
		);
		console.timeEnd("performanceTest");
		return null;
	}
}
