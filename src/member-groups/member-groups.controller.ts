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
} from "@nestjs/common";
import { MemberGroupsService } from "./member-groups.service";
import { UpdateMemberGroupDto } from "./dto/update-member-group.dto";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { GroupIdPipe } from "./pipes/member-group-id.pipe";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";

@UseGuards(JwtAuthGuard)
@Controller("member-groups")
export class GroupsController {
	constructor(private readonly groupsService: MemberGroupsService) { }

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.groupsService.create();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get()
	findAll() {
		return this.groupsService.findAll();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.findOne(+id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	update(
		@Param("id", GroupIdPipe) id: string,
		@Body() updateGroupDto: UpdateMemberGroupDto
	) {
		return this.groupsService.update(+id, updateGroupDto);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_MEMBER_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.remove(+id);
	}
}
