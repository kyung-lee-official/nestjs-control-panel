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
import { GroupsService } from "./groups.service";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GroupIdPipe } from "./pipes/group-id.pipe";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { IsVerifiedGuard } from "../users/guards/is-verified.guard";

@UseGuards(JwtAuthGuard)
@Controller("groups")
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Post()
	create() {
		return this.groupsService.create();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get()
	findAll() {
		return this.groupsService.findAll();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_GROUPS)
	@UseGuards(IsVerifiedGuard)
	@Get(":id")
	findOne(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.findOne(+id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Patch(":id")
	update(
		@Param("id", GroupIdPipe) id: string,
		@Body() updateGroupDto: UpdateGroupDto
	) {
		return this.groupsService.update(+id, updateGroupDto);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_GROUP)
	@UseGuards(IsVerifiedGuard)
	@Delete(":id")
	remove(@Param("id", GroupIdPipe) id: string) {
		return this.groupsService.remove(+id);
	}
}
