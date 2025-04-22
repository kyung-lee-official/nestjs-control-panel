import { z } from "zod";

export const skuSchema = z.object(
	{
		id: z.number(),
		sku: z.string(),
		nameZhCn: z.string(),
	},
	{ message: "Invalid SKU" }
);

export type Sku = z.infer<typeof skuSchema>;

const sharedkanbanFilterStateSchema = z.object({
	clients: z.array(z.string()),
	storehouses: z.array(z.string()),
	categories: z.array(z.string()),
	skus: z.union([skuSchema, z.array(skuSchema), z.null()]),
	receiptType: z.array(z.string()),
});

export const kanbanFilterStateSchema = z.discriminatedUnion("dateMode", [
	z
		.object({
			dateMode: z.literal("range"),
			dateRange: z.object({
				start: z.string().datetime("Invalid start datetime"),
				end: z.string().datetime("Invalid end datetime"),
			}),
		})
		.merge(sharedkanbanFilterStateSchema),
	z
		.object({
			dateMode: z.literal("month"),
			/* restrict to 0-11 */
			months: z.array(z.number().int().min(0).max(11)),
		})
		.merge(sharedkanbanFilterStateSchema),
]);

export type FilterSalesDataDto = z.infer<typeof kanbanFilterStateSchema>;
