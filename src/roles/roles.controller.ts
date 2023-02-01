import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from "./entities/role.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) { }

	@Post()
	create(@Body() createRoleDto: CreateRoleDto) {
		return this.rolesService.create(createRoleDto);
	}

	@Get()
	find(): Promise<Role[]> {
		return this.rolesService.find();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.rolesService.findOne(+id);
	}

	@Patch(':id')
	updateRoleById(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
		return this.rolesService.update(+id, updateRoleDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.rolesService.remove(+id);
	}
}
