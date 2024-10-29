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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
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
import { MemberVerificationGuard } from "./guards/member-verification.guard";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";
import { updateMemberProfileBodyOptions } from "./swagger/update-member-profile.swagger";
import { UpdateMemberEmailGuard } from "./guards/update-member-email.guard";
import { updateMemberEmailBodyOptions } from "./swagger/update-member-email.swagger";
import {
	UpdateMyPasswordDto,
	updateMyPasswordSchema,
} from "./dto/update-my-password.dto";
import {
	updateMyPasswordBodyOptions,
	updateMyPasswordOperationOptions,
} from "./swagger/update-my-password.swagger";
import { UpdateMemberPasswordGuard } from "./guards/update-member-password.guard";
import { FreezeMemberDto, freezeMemberSchema } from "./dto/freeze-member.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { findMembersByIdsBodyOptions } from "./swagger/find-members-by-ids.swagger";
import { FreezeMemberGuard } from "./guards/freeze-member.guard";
import { freezeMemberBodyOptions } from "./swagger/freeze-member.swagger";
import { TransferAdminGuard } from "./guards/transfer-admin.guard";

@ApiTags("Members")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("members")
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@ApiOperation(createMemberOperationOptions)
	@ApiBody(createMemberBodyOptions)
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(IsVerifiedGuard, CreateMemberGuard)
	@Post("/create")
	create(@Body() createMemberDto: CreateMemberDto) {
		return this.membersService.create(createMemberDto);
	}

	@UseGuards(IsVerifiedGuard, FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("/find")
	find(@Body() findMembersDto: FindMembersDto) {
		return this.membersService.find(findMembersDto);
	}

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

	@ApiOperation({ summary: "Find me by token" })
	@UseGuards(FindMeGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get("/me")
	findMe(): Promise<MemberWithoutPassword> {
		return this.membersService.findMe();
	}

	@UseGuards(IsVerifiedGuard, MemberVerificationGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/member-verification")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

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

	@ApiOperation(updateMyPasswordOperationOptions)
	@ApiBody(updateMyPasswordBodyOptions)
	@UseGuards(IsVerifiedGuard, UpdateMemberPasswordGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/my-password")
	updateMyPassword(
		@Body(new ZodValidationPipe(updateMyPasswordSchema))
		updateMyPasswordDto: UpdateMyPasswordDto
	) {
		return this.membersService.updateMyPassword(updateMyPasswordDto);
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

	@ApiBody(freezeMemberBodyOptions)
	@UseGuards(IsVerifiedGuard, FreezeMemberGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/freeze")
	freeze(
		@Param("id") id: string,
		@Body(new ZodValidationPipe(freezeMemberSchema))
		freezeMemberDto: FreezeMemberDto
	): Promise<Member> {
		return this.membersService.freeze(id, freezeMemberDto);
	}

	@ApiOperation({ summary: "Transfer member admin" })
	@UseGuards(IsVerifiedGuard, NotFrozenGuard, TransferAdminGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/transfer-member-admin")
	transferMemberAdmin(@Param("id") id: string) {
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
