import { Controller } from "@nestjs/common";
import { InternalService } from "./internal.service";

@Controller("internal")
export class InternalController {
	constructor(private readonly internalService: InternalService) {}
}
