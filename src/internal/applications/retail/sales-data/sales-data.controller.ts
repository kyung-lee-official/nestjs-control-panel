import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	UseInterceptors,
	UploadedFile,
	ParseIntPipe,
	Body,
} from "@nestjs/common";
import { SalesDataService } from "./sales-data.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import {
	FilterSalesDataDto,
	kanbanFilterStateSchema,
} from "./dto/filter-sales-date.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { filterSalesDataBodyOptions } from "./swagger/filter-sales-date.swagger";

@ApiTags("Retail Sales Data")
@Controller("internal/retail/sales-data")
export class SalesDataController {
	constructor(private readonly salesDataService: SalesDataService) {}

	@Post("import")
	@UseInterceptors(FileInterceptor("data"))
	async import(@UploadedFile() data: Express.Multer.File) {
		return this.salesDataService.import(data);
	}

	@Get("get-batches/:pageId")
	async getBatches(@Param("pageId", ParseIntPipe) pageId: number) {
		return await this.salesDataService.getBatches(pageId);
	}

	@Delete("delete-batch-by-id/:batchId")
	async delete(@Param("batchId", ParseIntPipe) batchId: number) {
		return await this.salesDataService.delete(batchId);
	}

	@Get("search-sku/:term")
	async searchSku(@Param("term") term: string) {
		return await this.salesDataService.searchSku(term);
	}

	@Get("get-all-skus")
	async getAllSkus() {
		return await this.salesDataService.getAllSkus();
	}

	@ApiBody(filterSalesDataBodyOptions)
	@Post("filter-sales-data")
	async filterSalesData(
		@Body(new ZodValidationPipe(kanbanFilterStateSchema))
		filterSalesDataDto: FilterSalesDataDto
	) {
		return await this.salesDataService.filterSalesData(filterSalesDataDto);
	}

	@Get("performance-test")
	async performanceTest() {
		if (process.env.ENV !== "DEV") {
			return {
				message: "This endpoint is only available in development mode.",
			};
		}
		return await this.salesDataService.performanceTest();
	}
}
