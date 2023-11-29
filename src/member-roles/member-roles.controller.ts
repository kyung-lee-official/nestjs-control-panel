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
import { MemberRolesService } from "./member-roles.service";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { MemberRole } from "./entities/member-role.entity";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredMemberRoles } from "./decorators/required-member-roles.decorator";
import { MemberRolesGuard } from "./guards/member-roles.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";

@UseGuards(JwtAuthGuard)
@Controller("member-roles")
export class MemberRolesController {
	constructor(private readonly memberRolesService: MemberRolesService) { }

	@UseGuards(MemberRolesGuard)
	@RequiredMemberRoles("admin")
	@UseGuards(IsVerifiedGuard)
	@Get("/updateAdminPermissions")
	updateAdminPermissions(): Promise<MemberRole> {
		return this.memberRolesService.updateAdminPermissions();
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.memberRolesService.create();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_ROLES)
	@UseGuards(IsVerifiedGuard)
	@Get()
	find(roleIds?: number[]): Promise<MemberRole[]> {
		return this.memberRolesService.find(roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_ROLES)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.memberRolesService.findOne(+id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	updateMemberRoleById(
		@Param("id") id: string,
		@Body() updateMemberRoleDto: UpdateMemberRoleDto
	): Promise<MemberRole> {
		return this.memberRolesService.updateMemberRoleById(+id, updateMemberRoleDto);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", new ParseIntPipe()) id: number) {
		return this.memberRolesService.remove(id);
	}
}
