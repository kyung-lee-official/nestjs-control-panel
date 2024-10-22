import { Controller, Get, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { JwtGuard } from "src/members/authentication/guards/jwt.guard";

@UseGuards(JwtGuard)
@Controller("permissions")
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) {}

	@Get()
	find() {
		return this.permissionsService.find();
	}
}
