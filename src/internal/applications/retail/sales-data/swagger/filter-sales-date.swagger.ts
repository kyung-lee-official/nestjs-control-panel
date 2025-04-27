import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { FilterSalesDataDto } from "../dto/filter-sales-date.dto";

export class FilterSalesData {
	dateMode: "range" | "month";
	clients: string[];
	storehouses: string[];
	categories: string[];
	receiptTypes: string[];
	sourceAttributes: string[];

	constructor(dto: FilterSalesDataDto) {
		this.dateMode = dto.dateMode;
		this.clients = dto.clients;
		this.storehouses = dto.storehouses;
		this.categories = dto.categories;
		this.receiptTypes = dto.receiptTypes;
		this.sourceAttributes = dto.sourceAttributes;
	}
}

export const filterSalesDataOperationOptions: ApiOperationOptions = {
	summary: "Filter sales data",
};

export const filterSalesDataBodyOptions: ApiBodyOptions = {
	type: FilterSalesData,
	examples: {
		"Filter sales data": {
			value: {
				dateMode: "range",
				dateRange: {
					start: "2024-01-01T00:00:00Z",
					end: "2025-05-31T23:59:59Z",
				},
				clients: [],
				storehouses: [],
				categories: [],
				receiptTypes: [],
				sourceAttributes: [],
				skus: [],
			},
		},
	},
};
