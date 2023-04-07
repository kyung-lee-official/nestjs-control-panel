import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, ParseArrayPipe, UseInterceptors, ClassSerializerInterceptor, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { UpdateUserEmailDto } from "./dto/update-user-email.dto";
import { UpdateUserRolesDto } from "./dto/update-user-roles.dto";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dto";
import { FindUsersByIdsDto } from "./dto/find-users-by-ids.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserGroupsDto } from "./dto/update-user-groups.dto";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
	) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_USER)
	@Post("/create")
	create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.create(createUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS)
	@Get()
	find(
		@Query("email") email?,
		@Query("nickname") nickname?,
		@Query("roleIds", new ParseArrayPipe({ optional: true })) roleIds?: string[],
	): Promise<User[]> {
		return this.usersService.find(email, nickname, roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS)
	@Get("ids")
	findUsersByIds(
		@Body() findUsersByIdsDto: FindUsersByIdsDto,
	): Promise<User[]> {
		return this.usersService.findUsersByIds(findUsersByIdsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ME)
	@Get('/me')
	findMe(): Promise<User> {
		return this.usersService.findMe();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS, Permissions.GET_ME)
	@Get('/:id')
	findOne(@Param('id') id: string): Promise<User> {
		return this.usersService.findOne(id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@Patch('/profile/:id')
	update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return this.usersService.update(id, updateUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@Patch('/email/:id')
	updateUserEmail(
		@Param('id') id: string,
		@Body() updateUserEmailDto: UpdateUserEmailDto,
	): Promise<User> {
		return this.usersService.updateUserEmail(id, updateUserEmailDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER)
	@Patch('/roles/:id')
	updateUserRoles(
		@Param('id') id: string,
		@Body() updateUserRolesDto: UpdateUserRolesDto,
	): Promise<User> {
		return this.usersService.updateUserRoles(id, updateUserRolesDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER)
	@Patch('/roles/:id')
	updateUserGroups(
		@Param('id') id: string,
		@Body() updateUserGroupsDto: UpdateUserGroupsDto,
	): Promise<User> {
		return this.usersService.updateUserGroups(id, updateUserGroupsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@Patch('/password/:id')
	updateUserPassword(
		@Param('id') id: string,
		@Body() updateUserPasswordDto: UpdateUserPasswordDto,
	): Promise<User> {
		return this.usersService.updateUserPassword(id, updateUserPasswordDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.TRANSFER_ADMIN)
	@Patch('/transferAdmin/:id')
	transferAdmim(
		@Param('id') id: string,
	): Promise<User> {
		return this.usersService.transferAdmim(id);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_USER)
	@Delete('/:id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
