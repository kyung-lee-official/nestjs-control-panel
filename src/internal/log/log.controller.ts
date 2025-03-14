import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { LogService } from "./log.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Log")
@Controller("internal/log")
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Get(":page")
	async getLogs(@Param("page", ParseIntPipe) page: number) {
		return await this.logService.getLogs(page);
	}
}
