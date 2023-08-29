import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	ClassSerializerInterceptor,
	ParseIntPipe,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./entities/role.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredRoles } from "./decorators/required-roles.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { IsVerifiedGuard } from "../users/guards/is-verified.guard";

@UseGuards(JwtAuthGuard)
@Controller("roles")
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@UseGuards(RolesGuard)
	@RequiredRoles("admin")
	@UseGuards(IsVerifiedGuard)
	@Get("/updateAdminPermissions")
	updateAdminPermissions(): Promise<Role> {
		return this.rolesService.updateAdminPermissions();
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.rolesService.create();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ROLES)
	@UseGuards(IsVerifiedGuard)
	@Get()
	find(roleIds?: number[]): Promise<Role[]> {
		return this.rolesService.find(roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ROLES)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.rolesService.findOne(+id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	updateRoleById(
		@Param("id") id: string,
		@Body() updateRoleDto: UpdateRoleDto
	): Promise<Role> {
		return this.rolesService.updateRoleById(+id, updateRoleDto);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", new ParseIntPipe()) id: number) {
		return this.rolesService.remove(id);
	}
}
