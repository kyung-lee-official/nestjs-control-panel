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
import { ApiTags } from "@nestjs/swagger";
import {
	FilterSalesDataDto,
	kanbanFilterStateSchema,
} from "./dto/filter-sales-date.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";

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

	@Delete(":batchId")
	async delete(@Param("batchId", ParseIntPipe) batchId: number) {
		return await this.salesDataService.delete(batchId);
	}

	@Get("get-clients")
	async getClients() {
		return await this.salesDataService.getClients();
	}

	@Get("get-storehouses")
	async getStorehouses() {
		return await this.salesDataService.getStorehouses();
	}

	@Get("get-categories")
	async getCategories() {
		return await this.salesDataService.getCategories();
	}

	@Get("search-sku/:term")
	async searchSku(@Param("term") term: string) {
		return await this.salesDataService.searchSku(term);
	}

	@Post("filter-sales-data")
	async filterSalesData(
		@Body(new ZodValidationPipe(kanbanFilterStateSchema))
		filterSalesDataDto: FilterSalesDataDto
	) {
		return await this.salesDataService.filterSalesData(filterSalesDataDto);
	}
}
