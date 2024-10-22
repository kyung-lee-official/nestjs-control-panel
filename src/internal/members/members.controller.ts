import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	Post,
	Put,
	UploadedFile,
	Req,
	Res,
	HttpCode,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { UpdateMemberDto } from "./dto/update-member.dto";
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
import { FindMembersDto } from "./dto/find-members.dto";
import { Member } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { MemberWithoutPassword } from "../../utils/types";
import { ExcludePasswordInterceptor } from "../../interceptors/exclude-password.interceptor";
import { JwtGuard } from "../authentication/guards/jwt.guard";

@UseGuards(JwtGuard)
@Controller("members")
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@ApiOperation({ summary: "Create a member by email" })
	@ApiBody({
		type: CreateMemberDto,
		examples: {
			"Create a member by email": {
				value: {
					email: process.env.E2E_TEST_MEMBER_3_EMAIL,
					nickname: process.env.E2E_TEST_MEMBER_3_NICKNAME,
					password: "1234Abcd!",
				},
			},
		},
	})
	@ApiBearerAuth()
	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.CREATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Post("/create")
	create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.membersService.create(createMemberDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.GET_MEMBERS)
	@UseGuards(IsVerifiedGuard)
	@HttpCode(200)
	@Post("/find")
	find(@Body() findMembersDto: FindMembersDto): Promise<Member[]> {
		return this.membersService.find(findMembersDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.GET_MEMBERS)
	@UseGuards(IsVerifiedGuard)
	@Get("ids")
	findMembersByIds(
		@Body() findMembersByIdsDto: FindMembersByIdsDto
	): Promise<Member[]> {
		return this.membersService.findMembersByIds(findMembersByIdsDto);
	}

	@ApiOperation({ summary: "Find me by token" })
	@ApiBearerAuth()
	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.GET_MEMBER_ME)
	@Get("/me")
	findMe(): Promise<MemberWithoutPassword> {
		return this.membersService.findMe();
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/member-verification")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(
	// 	Permissions.UPDATE_MEMBER,
	// 	Permissions.UPDATE_MEMBER_ME
	// )
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/profile")
	update(
		@Param("id") id: string,
		@Body() updateMemberDto: UpdateMemberDto
	): Promise<Member> {
		return this.membersService.update(id, updateMemberDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(
	// 	Permissions.UPDATE_MEMBER,
	// 	Permissions.UPDATE_MEMBER_ME
	// )
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/email")
	updateMemberEmail(
		@Param("id") id: string,
		@Body() updateMemberEmailDto: UpdateMemberEmailDto
	) {
		return this.membersService.updateMemberEmail(id, updateMemberEmailDto);
	}

	@ApiOperation({ summary: "Update a member's roles" })
	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/roles")
	updateMemberRoles(
		@Param("id") id: string,
		@Body() updateMemberRolesDto: UpdateMemberRolesDto
	) {
		return this.membersService.updateMemberRoles(id, updateMemberRolesDto);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/groups")
	updateMemberGroups(
		@Param("id") id: string,
		@Body() updateMemberGroupsDto: UpdateMemberGroupsDto
	) {
		return this.membersService.updateMemberGroups(
			id,
			updateMemberGroupsDto
		);
	}

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(
	// 	Permissions.UPDATE_MEMBER,
	// 	Permissions.UPDATE_MEMBER_ME
	// )
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/password")
	updateMemberPassword(
		@Param("id") id: string,
		@Body() updateMemberPasswordDto: UpdateMemberPasswordDto
	) {
		return this.membersService.updateMemberPassword(
			id,
			updateMemberPasswordDto
		);
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

	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.UPDATE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/freeze")
	freeze(
		@Param("id") id: string,
		@Body() freezeMemberDto: FreezeMemberDto
	): Promise<Member> {
		return this.membersService.freeze(id, freezeMemberDto);
	}

	@ApiOperation({ summary: "Transfer member admin" })
	@ApiBearerAuth()
	@UseInterceptors(ExcludePasswordInterceptor)
	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.TRANSFER_MEMBER_ADMIN)
	@UseGuards(NotFrozenGuard)
	@UseGuards(IsVerifiedGuard)
	@Patch("/:id/transfer-member-admin")
	transferMemberAdmin(@Param("id") id: string): Promise<Member> {
		console.log("transferMemberAdmin id: ", id);
		return this.membersService.transferMemberAdmin(id);
	}

	// @UseGuards(PermissionsGuard)
	// @RequiredPermissions(Permissions.DELETE_MEMBER)
	@UseGuards(IsVerifiedGuard)
	@Delete("/:id")
	remove(@Param("id") id: string): Promise<Member> {
		return this.membersService.remove(id);
	}
}
