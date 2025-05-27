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
	UseGuards,
} from "@nestjs/common";
import { SalesDataService } from "./sales-data.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	FilterSalesDataDto,
	kanbanFilterStateSchema,
} from "./dto/filter-sales-date.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { filterSalesDataBodyOptions } from "./swagger/filter-sales-date.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { SalesDataGuard } from "./guards/sales-data.guard";

@ApiTags("Retail Sales Data")
@UseGuards(JwtGuard)
@Controller("internal/retail/sales-data")
export class SalesDataController {
	constructor(private readonly salesDataService: SalesDataService) {}

	@ApiOperation({ summary: "Get my permissions of retail sales data" })
	@Get("permissions")
	async permissions() {
		return await this.salesDataService.permissions();
	}

	@UseGuards(SalesDataGuard)
	@Post("import")
	@UseInterceptors(FileInterceptor("data"))
	async import(@UploadedFile() data: Express.Multer.File) {
		return this.salesDataService.import(data);
	}

	@UseGuards(SalesDataGuard)
	@Get("get-batches/:pageId")
	async getBatches(@Param("pageId", ParseIntPipe) pageId: number) {
		return await this.salesDataService.getBatches(pageId);
	}

	@UseGuards(SalesDataGuard)
	@Delete("delete-batch-by-id/:batchId")
	async delete(@Param("batchId", ParseIntPipe) batchId: number) {
		return await this.salesDataService.delete(batchId);
	}

	@UseGuards(SalesDataGuard)
	@Get("search-sku/:term")
	async searchSku(@Param("term") term: string) {
		return await this.salesDataService.searchSku(term);
	}

	@UseGuards(SalesDataGuard)
	@Get("get-all-skus")
	async getAllSkus() {
		return await this.salesDataService.getAllSkus();
	}

	@ApiBody(filterSalesDataBodyOptions)
	@UseGuards(SalesDataGuard)
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
