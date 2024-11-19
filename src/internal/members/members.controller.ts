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
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { CreateMemberDto } from "./dto/create-member.dto";
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
import { MemberVerificationGuard } from "./guards/member-verification.guard";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";
import { updateMemberProfileBodyOptions } from "./swagger/update-member-profile.swagger";
import { FreezeMemberDto, freezeMemberSchema } from "./dto/freeze-member.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { findMembersByIdsBodyOptions } from "./swagger/find-members-by-ids.swagger";
import { FreezeMemberGuard } from "./guards/freeze-member.guard";
import { freezeMemberBodyOptions } from "./swagger/freeze-member.swagger";
import { TransferAdminGuard } from "./guards/transfer-admin.guard";
import { RemoveMemberGuard } from "./guards/remove-member.guard";

@ApiTags("Members")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/members")
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@ApiOperation(createMemberOperationOptions)
	@ApiBody(createMemberBodyOptions)
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(CreateMemberGuard)
	@Post("/create")
	create(@Body() createMemberDto: CreateMemberDto) {
		return this.membersService.create(createMemberDto);
	}

	@UseGuards(FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("/find")
	find(@Body() findMembersDto: FindMembersDto) {
		return this.membersService.find(findMembersDto);
	}

	@ApiBody(findMembersByIdsBodyOptions)
	@UseGuards(FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
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

	@UseGuards(MemberVerificationGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/member-verification")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

	@ApiBody(updateMemberProfileBodyOptions)
	@UseGuards(UpdateMemberProfileGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/profile")
	updateProfile(
		@Param("id") id: string,
		@Body() updateMemberProfileDto: UpdateMemberProfileDto
	): Promise<Member> {
		return this.membersService.updateProfile(id, updateMemberProfileDto);
	}

	@UseGuards()
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
	@UseGuards(FreezeMemberGuard)
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
	@UseGuards(NotFrozenGuard, TransferAdminGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/transfer-member-admin")
	transferMemberAdmin(@Param("id") id: string) {
		return this.membersService.transferMemberAdmin(id);
	}

	@UseGuards(RemoveMemberGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Delete("/:id")
	remove(@Param("id") id: string): Promise<Member> {
		return this.membersService.remove(id);
	}
}
