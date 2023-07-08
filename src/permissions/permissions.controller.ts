import { Controller, Get, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("permissions")
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) {}

	@Get()
	find() {
		return this.permissionsService.find();
	}
}
