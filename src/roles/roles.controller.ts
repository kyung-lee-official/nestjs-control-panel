import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from "./entities/role.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { RequiredRoles } from "./decorators/required-roles.decorator";
import { RolesGuard } from "./guards/roles.guard";

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) { }

	@UseGuards(RolesGuard)
	@RequiredRoles("admin")
	@Get("/updateAdminRole")
	updateAdminRole(): Promise<Role> {
		return this.rolesService.updateAdminRole();
	}

	@Post()
	create(@Body() createRoleDto: CreateRoleDto) {
		return this.rolesService.create(createRoleDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ROLES)
	@Get()
	find(): Promise<Role[]> {
		return this.rolesService.find();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ROLES)
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
