import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { LogService } from "./log.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../authentication/guards/jwt.guard";

@ApiTags("Log")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/log")
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Get(":page")
	async getLogs(@Param("page", ParseIntPipe) page: number) {
		return await this.logService.getLogs(page);
	}
}
