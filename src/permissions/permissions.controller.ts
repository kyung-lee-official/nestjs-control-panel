import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) { }

	@Get()
	find() {
		return this.permissionsService.find();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.permissionsService.findOne(+id);
	}
}
