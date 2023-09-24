import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	ParseArrayPipe,
	UseInterceptors,
	ClassSerializerInterceptor,
	Post,
	Put,
	UploadedFile,
	Req,
	Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { UpdateUserEmailDto } from "./dto/update-user-email.dto";
import { UpdateUserRolesDto } from "./dto/update-user-roles.dto";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dto";
import { FindUsersByIdsDto } from "./dto/find-users-by-ids.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserGroupsDto } from "./dto/update-user-groups.dto";
import { IsVerifiedGuard } from "./guards/is-verified.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { FreezeUserDto } from "./dto/freeze-user.dto";
import { NotFrozenGuard } from "./guards/not-frozen.guard";
import { Role } from "src/roles/entities/role.entity";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_USER)
	@UseGuards(IsVerifiedGuard)
	@Post("/create")
	create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.create(createUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS)
	@UseGuards(IsVerifiedGuard)
	@Get()
	find(
		@Query("email") email?: string,
		@Query("nickname") nickname?: string,
		@Query("roleIds", new ParseArrayPipe({ optional: true }))
		roleIds?: string[]
	): Promise<User[]> {
		return this.usersService.find(email, nickname, roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS)
	@UseGuards(IsVerifiedGuard)
	@Get("ids")
	findUsersByIds(
		@Body() findUsersByIdsDto: FindUsersByIdsDto
	): Promise<User[]> {
		return this.usersService.findUsersByIds(findUsersByIdsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_ME)
	@Get("/me")
	findMe(): Promise<User> {
		return this.usersService.findMe();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_USERS, Permissions.GET_ME)
	@UseGuards(IsVerifiedGuard)
	@Get("/:id")
	findOne(@Param("id") id: string): Promise<User> {
		return this.usersService.findOne(id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/profile/:id")
	update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto
	): Promise<User> {
		return this.usersService.update(id, updateUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/email/:id")
	updateUserEmail(
		@Param("id") id: string,
		@Body() updateUserEmailDto: UpdateUserEmailDto
	): Promise<User> {
		return this.usersService.updateUserEmail(id, updateUserEmailDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/roles/:id")
	updateUserRoles(
		@Param("id") id: string,
		@Body() updateUserRolesDto: UpdateUserRolesDto
	): Promise<User> {
		return this.usersService.updateUserRoles(id, updateUserRolesDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/groups/:id")
	updateUserGroups(
		@Param("id") id: string,
		@Body() updateUserGroupsDto: UpdateUserGroupsDto
	): Promise<User> {
		return this.usersService.updateUserGroups(id, updateUserGroupsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER, Permissions.UPDATE_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/password/:id")
	updateUserPassword(
		@Param("id") id: string,
		@Body() updateUserPasswordDto: UpdateUserPasswordDto
	): Promise<User> {
		return this.usersService.updateUserPassword(id, updateUserPasswordDto);
	}

	@UseGuards(IsVerifiedGuard)
	@Put("updateAvatar")
	@UseInterceptors(FileInterceptor("file"))
	async updateAvatar(
		@Req() req: any,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.usersService.updateAvatar(req, file);
	}

	@Get("downloadAvatar/:id")
	downloadAvatar(@Param("id") id: string, @Req() req: any, @Res() res: any) {
		return this.usersService.downloadAvatar(id, req, res);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_USER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/freeze/:id")
	freeze(
		@Param("id") id: string,
		@Body() freezeUserDto: FreezeUserDto
	): Promise<User> {
		return this.usersService.freeze(id, freezeUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.TRANSFER_ADMIN)
	@UseGuards(NotFrozenGuard)
	@UseGuards(IsVerifiedGuard)
	@Patch("/transferOwnership/:id")
	transferOwnership(
		@Param("id") id: string
	): Promise<{ isTransferred: boolean }> {
		return this.usersService.transferOwnership(id);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_USER)
	@UseGuards(IsVerifiedGuard)
	@Delete("/:id")
	remove(@Param("id") id: string) {
		return this.usersService.remove(id);
	}
}
