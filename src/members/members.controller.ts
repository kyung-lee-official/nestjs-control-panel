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
import { MembersService } from "./members.service";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { Member } from "./entities/member.entity";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { UpdateMemberEmailDto } from "./dto/update-member-email.dto";
import { UpdateMemberRolesDto } from "./dto/update-member-roles.dto";
import { UpdateMemberPasswordDto } from "./dto/update-member-password.dto";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberGroupsDto } from "./dto/update-member-groups.dto";
import { IsVerifiedGuard } from "./guards/is-verified.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { NotFrozenGuard } from "./guards/not-frozen.guard";
import { MemberRole } from "src/member-roles/entities/member-role.entity";

@UseGuards(JwtAuthGuard)
@Controller("members")
export class MembersController {
	constructor(private readonly membersService: MembersService) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.CREATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Post("/create")
	create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.membersService.create(createMemberDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBERS)
	@UseGuards(IsVerifiedGuard)
	@Get()
	find(
		@Query("email") email?: string,
		@Query("nickname") nickname?: string,
		@Query("roleIds", new ParseArrayPipe({ optional: true }))
		roleIds?: string[]
	): Promise<Member[]> {
		return this.membersService.find(email, nickname, roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBERS)
	@UseGuards(IsVerifiedGuard)
	@Get("ids")
	findMembersByIds(
		@Body() findMembersByIdsDto: FindMembersByIdsDto
	): Promise<Member[]> {
		return this.membersService.findMembersByIds(findMembersByIdsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_ME)
	@Get("/me")
	findMe(): Promise<Member> {
		return this.membersService.findMe();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/member-verification/:id")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER, Permissions.UPDATE_MEMBER_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/profile/:id")
	update(
		@Param("id") id: string,
		@Body() updateMemberDto: UpdateMemberDto
	): Promise<Member> {
		return this.membersService.update(id, updateMemberDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER, Permissions.UPDATE_MEMBER_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/email/:id")
	updateMemberEmail(
		@Param("id") id: string,
		@Body() updateMemberEmailDto: UpdateMemberEmailDto
	): Promise<Member> {
		return this.membersService.updateMemberEmail(id, updateMemberEmailDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/roles/:id")
	updateMemberRoles(
		@Param("id") id: string,
		@Body() updateMemberRolesDto: UpdateMemberRolesDto
	): Promise<Member> {
		return this.membersService.updateMemberRoles(id, updateMemberRolesDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/groups/:id")
	updateMemberGroups(
		@Param("id") id: string,
		@Body() updateMemberGroupsDto: UpdateMemberGroupsDto
	): Promise<Member> {
		return this.membersService.updateMemberGroups(id, updateMemberGroupsDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER, Permissions.UPDATE_MEMBER_ME)
	@UseGuards(IsVerifiedGuard)
	@Patch("/password/:id")
	updateMemberPassword(
		@Param("id") id: string,
		@Body() updateMemberPasswordDto: UpdateMemberPasswordDto
	): Promise<Member> {
		return this.membersService.updateMemberPassword(id, updateMemberPasswordDto);
	}

	@UseGuards(IsVerifiedGuard)
	@Put("updateAvatar")
	@UseInterceptors(FileInterceptor("file"))
	async updateAvatar(
		@Req() req: any,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.membersService.updateAvatar(req, file);
	}

	@Get("downloadAvatar/:id")
	downloadAvatar(@Param("id") id: string, @Req() req: any, @Res() res: any) {
		return this.membersService.downloadAvatar(id, req, res);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/freeze/:id")
	freeze(
		@Param("id") id: string,
		@Body() freezeMemberDto: FreezeMemberDto
	): Promise<Member> {
		return this.membersService.freeze(id, freezeMemberDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.TRANSFER_MEMBER_ADMIN)
	@UseGuards(NotFrozenGuard)
	@UseGuards(IsVerifiedGuard)
	@Patch("/transferOwnership/:id")
	transferOwnership(
		@Param("id") id: string
	): Promise<{ isTransferred: boolean; }> {
		return this.membersService.transferOwnership(id);
	}

	@UseGuards(PermissionsGuard)
	@RequiredPermissions(Permissions.DELETE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Delete("/:id")
	remove(@Param("id") id: string) {
		return this.membersService.remove(id);
	}
}
