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
import {
	UpdateMemberEmailDto,
	updateMemberEmailSchema,
} from "./dto/update-member-email.dto";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { CreateMemberDto } from "./dto/create-member.dto";
import { IsVerifiedGuard } from "./guards/is-verified.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { NotFrozenGuard } from "./guards/not-frozen.guard";
import { FindMembersDto } from "./dto/find-members.dto";
import { Member } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MemberWithoutPassword } from "../../utils/types";
import { ExcludePasswordInterceptor } from "../../interceptors/exclude-password.interceptor";
import { JwtGuard } from "../authentication/guards/jwt.guard";
import { FindMeGuard } from "./guards/find-me.guard";
import {
	createMemberBodyOptions,
	createMemberOperationOptions,
} from "./swagger/create-member.swagger";
import { CreateMemberGuard } from "./guards/create-member.guard";
import { FindMembersGuard } from "./guards/find-members.guard";
import { UpdateMemberProfileGuard } from "./guards/update-member-profile.guard";
import { VerificationGuard } from "./guards/verification.guard";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";
import { updateMemberProfileBodyOptions } from "./swagger/update-member-profile.swagger";
import { UpdateMemberEmailGuard } from "./guards/update-member-email.guard";
import { updateMemberEmailBodyOptions } from "./swagger/update-member-email.swagger";
import {
	UpdateMemberPasswordDto,
	updateMemberPasswordSchema,
} from "./dto/update-member-password.dto";
import { updateMemberPasswordBodyOptions } from "./swagger/update-member-password.swagger";
import { UpdateMemberPasswordGuard } from "./guards/update-member-password.guard";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { findMembersByIdsBodyOptions } from "./swagger/find-members-by-ids.swagger";

@ApiTags("Members")
@UseGuards(JwtGuard)
@Controller("members")
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@ApiBearerAuth()
	@ApiOperation(createMemberOperationOptions)
	@ApiBody(createMemberBodyOptions)
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(IsVerifiedGuard, CreateMemberGuard)
	@Post("/create")
	create(@Body() createMemberDto: CreateMemberDto) {
		return this.membersService.create(createMemberDto);
	}

	@ApiBearerAuth()
	@UseGuards(IsVerifiedGuard, FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("/find")
	find(@Body() findMembersDto: FindMembersDto) {
		return this.membersService.find(findMembersDto);
	}

	@ApiBearerAuth()
	@ApiBody(findMembersByIdsBodyOptions)
	@UseGuards(IsVerifiedGuard, FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(IsVerifiedGuard)
	@Post("find-members-by-ids/:id")
	findMembersByIds(
		@Body() findMembersByIdsDto: FindMembersByIdsDto
	): Promise<Member[]> {
		return this.membersService.findMembersByIds(findMembersByIdsDto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: "Find me by token" })
	@UseGuards(FindMeGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get("/me")
	findMe(): Promise<MemberWithoutPassword> {
		return this.membersService.findMe();
	}

	@ApiBearerAuth()
	@UseGuards(IsVerifiedGuard, VerificationGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/member-verification")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

	@ApiBearerAuth()
	@ApiBody(updateMemberProfileBodyOptions)
	@UseGuards(IsVerifiedGuard, UpdateMemberProfileGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/profile")
	updateProfile(
		@Param("id") id: string,
		@Body() updateMemberProfileDto: UpdateMemberProfileDto
	): Promise<Member> {
		return this.membersService.updateProfile(id, updateMemberProfileDto);
	}

	@ApiBearerAuth()
	@ApiBody(updateMemberEmailBodyOptions)
	@UseGuards(IsVerifiedGuard, UpdateMemberEmailGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/email")
	updateMemberEmail(
		@Param("id") id: string,
		@Body(new ZodValidationPipe(updateMemberEmailSchema))
		updateMemberEmailDto: UpdateMemberEmailDto
	) {
		return this.membersService.updateMemberEmail(id, updateMemberEmailDto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: "Update member password, old password required" })
	@ApiBody(updateMemberPasswordBodyOptions)
	@UseGuards(IsVerifiedGuard, UpdateMemberPasswordGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/password")
	updateMemberPassword(
		@Param("id") id: string,
		@Body(new ZodValidationPipe(updateMemberPasswordSchema))
		updateMemberPasswordDto: UpdateMemberPasswordDto
	) {
		return this.membersService.updateMemberPassword(
			id,
			updateMemberPasswordDto
		);
	}

	@UseGuards(IsVerifiedGuard)
	@Put("update-avatar")
	@UseInterceptors(FileInterceptor("file"))
	async updateAvatar(
		@Req() req: any,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.membersService.updateAvatar(req, file);
	}

	@Get("download-avatar/:id")
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
	transferMemberAdmin(@Param("id") id: string) {
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
