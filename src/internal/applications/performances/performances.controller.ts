import { Controller } from "@nestjs/common";
import { PerformancesService } from "./performances.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Performance")
@Controller("performances")
export class PerformancesController {
	constructor(private readonly performancesService: PerformancesService) {}
}
