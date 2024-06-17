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
	ParseIntPipe,
	HttpCode,
} from "@nestjs/common";
import { MemberRolesService } from "./member-roles.service";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredMemberRoles } from "./decorators/required-member-roles.decorator";
import { MemberRolesGuard } from "./guards/member-roles.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import { MemberRole, Permission } from "@prisma/client";
import { FindMemberRoleDto } from "./dto/find-member-role.dto";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { ExcludePasswordInterceptor } from "../interceptors/exclude-password.interceptor";

@UseGuards(JwtAuthGuard)
@Controller("member-roles")
export class MemberRolesController {
	constructor(private readonly memberRolesService: MemberRolesService) {}

	@UseGuards(MemberRolesGuard)
	@RequiredMemberRoles("admin")
	@UseGuards(IsVerifiedGuard)
	@Get("/updateAdminPermissions")
	updateAdminPermissions(): Promise<MemberRole> {
		return this.memberRolesService.updateAdminPermissions();
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permission.CREATE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.memberRolesService.create();
	}

	@ApiOperation({ summary: "Find member-roles by ids" })
	@ApiBody({
		type: FindMemberRoleDto,
		examples: {
			"Find member-roles by ids": {
				value: {
					roleIds: [],
				},
			},
		},
	})
	@ApiBearerAuth()
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permission.GET_MEMBER_ROLES)
	@UseGuards(IsVerifiedGuard)
	@HttpCode(200)
	@Post("/find")
	find(@Body() findMemberRoleDto: FindMemberRoleDto): Promise<MemberRole[]> {
		return this.memberRolesService.find(findMemberRoleDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permission.GET_MEMBER_ROLES)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.memberRolesService.findOne(+id);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permission.UPDATE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	updateMemberRoleById(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateMemberRoleDto: UpdateMemberRoleDto
	): Promise<MemberRole> {
		return this.memberRolesService.updateMemberRoleById(
			id,
			updateMemberRoleDto
		);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permission.DELETE_MEMBER_ROLE)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.memberRolesService.remove(id);
	}
}
