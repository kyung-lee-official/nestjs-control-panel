import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	UseInterceptors,
	UploadedFile,
	ParseIntPipe,
} from "@nestjs/common";
import { SalesDataService } from "./sales-data.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";

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
	delete(@Param("batchId", ParseIntPipe) batchId: number) {
		return this.salesDataService.delete(batchId);
	}
}
