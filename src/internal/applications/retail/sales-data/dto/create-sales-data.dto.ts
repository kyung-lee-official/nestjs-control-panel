import { z } from "zod";

export const retailSalesDataReqSchema = z.object({
	date: z.string().datetime(),
	receiptType: z.string({ message: "Receipt Type is required" }),
	client: z.string({ message: "Client is required" }),
	department: z.string({ message: "Department is required" }),
	sku: z.string({ message: "SKU is required" }),
	nameZhCn: z.string({ message: "Name is required" }),
	salesVolume: z.number({ message: "Sales Volume is required" }),
	platformAddress: z.string().nullable(),
	platformOrderId: z.string({
		message: "Platform Order ID is required",
	}),
	storehouse: z.string({ message: "Storehouse is required" }),
	category: z.string().nullable(),
	taxInclusivePriceCny: z.number().nullable(),
	priceCny: z.number().nullable(),
	unitPriceCny: z.number().nullable(),
});
export type RetailSalesReqData = z.infer<typeof retailSalesDataReqSchema>;
export const retailSalesReqDataArraySchema = z.array(retailSalesDataReqSchema);

export const retailSalesDataWithBatchIdSchema = retailSalesDataReqSchema.extend(
	{
		batchId: z.number(),
	}
);
export type RetailSalesDataWithBatchId = z.infer<
	typeof retailSalesDataWithBatchIdSchema
>;
