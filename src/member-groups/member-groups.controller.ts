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
} from "@nestjs/common";
import { MemberGroupsService } from "./member-groups.service";
import { UpdateMemberGroupDto } from "./dto/update-member-group.dto";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { GroupIdPipe } from "./pipes/member-group-id.pipe";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import { TransferMemberGroupOwnershipDto } from "./dto/transfer-member-group-ownershiop.dto";
import { ExcludePasswordInterceptor } from "../interceptors/exclude-password.interceptor";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller("member-groups")
export class GroupsController {
	constructor(private readonly groupsService: MemberGroupsService) {}

	@ApiOperation({ summary: "Create a member group" })
	@ApiBearerAuth()
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.groupsService.create();
	}

	@ApiOperation({ summary: "Get all member groups" })
	@ApiBearerAuth()
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get()
	findAll() {
		return this.groupsService.findAll();
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update name and members of a member group" })
	@ApiBearerAuth()
	@ApiBody({ type: UpdateMemberGroupDto })
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	update(
		@Param("id", GroupIdPipe) id: number,
		@Body() updateGroupDto: UpdateMemberGroupDto
	) {
		return this.groupsService.update(id, updateGroupDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(
		Permissions.UPDATE_MEMBER_GROUP,
		Permissions.TRANSFER_MEMBER_GROUP_OWNER
	)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id/transfer-ownership")
	transferOwnership(
		@Param("id", GroupIdPipe) id: string,
		@Body() transferMemberGroupOwnershipDto: TransferMemberGroupOwnershipDto
	) {
		return this.groupsService.transferOwnership(
			+id,
			transferMemberGroupOwnershipDto
		);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.remove(+id);
	}
}
