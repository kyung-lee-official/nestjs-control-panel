import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GroupIdPipe } from "./pipes/group-id.pipe";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) { }

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_GROUP)
	@Post()
	create(@Body() createGroupDto: CreateGroupDto) {
		return this.groupsService.create(createGroupDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_GROUPS)
	@Get()
	findAll() {
		return this.groupsService.findAll();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_GROUPS)
	@Get(':id')
	findOne(@Param('id', GroupIdPipe) id: string) {
		return this.groupsService.findOne(+id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_GROUP)
	@Patch(':id')
	update(@Param('id', GroupIdPipe) id: string, @Body() updateGroupDto: UpdateGroupDto) {
		return this.groupsService.update(+id, updateGroupDto);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_GROUP)
	@Delete(':id')
	remove(@Param('id', GroupIdPipe) id: string) {
		return this.groupsService.remove(+id);
	}
}
