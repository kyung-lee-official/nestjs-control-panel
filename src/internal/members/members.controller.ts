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
	FindMembersByIdsDto,
	findMembersByIdsSchema,
} from "./dto/find-members-by-ids.dto";
import { CreateMemberDto, createMemberSchema } from "./dto/create-member.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { NotFrozenGuard } from "./guards/not-frozen.guard";
import { FindMembersDto, findMembersSchema } from "./dto/find-members.dto";
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
import { UpdateMyProfileGuard } from "./guards/update-my-profile.guard";
import { MemberVerificationGuard } from "./guards/member-verification.guard";
import {
	UpdateMemberProfileDto,
	updateMemberProfileSchema,
} from "./dto/update-member-profile.dto";
import { updateMemberProfileBodyOptions } from "./swagger/update-member-profile.swagger";
import { FreezeMemberDto, freezeMemberSchema } from "./dto/freeze-member.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { findMembersByIdsBodyOptions } from "./swagger/find-members-by-ids.swagger";
import { FreezeMemberGuard } from "./guards/freeze-member.guard";
import { freezeMemberBodyOptions } from "./swagger/freeze-member.swagger";
import { DeleteMemberGuard } from "./guards/delete-member.guard";
import {
	searchMemberBodyOptions,
	searchMemberOperationOptions,
} from "./swagger/search-members.swagger";
import { verifyMemberOperationOptions } from "./swagger/verify-member.swagger";
import { getMeAndMembersOfMySubRoles } from "./swagger/get-me-and-members-of-my-subroles.swagger";

@ApiTags("Members")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/members")
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@ApiOperation({ summary: "Get members permissions" })
	@Get("permissions")
	async permissions() {
		return await this.membersService.permissions();
	}

	@ApiOperation(createMemberOperationOptions)
	@ApiBody(createMemberBodyOptions)
	@UseInterceptors(ExcludePasswordInterceptor)
	@UseGuards(CreateMemberGuard)
	@Post("create")
	create(
		@Body(new ZodValidationPipe(createMemberSchema))
		createMemberDto: CreateMemberDto
	) {
		return this.membersService.create(createMemberDto);
	}

	@ApiOperation(searchMemberOperationOptions)
	@ApiBody(searchMemberBodyOptions)
	@UseGuards(FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("search")
	search(
		@Body(new ZodValidationPipe(findMembersSchema))
		findMembersDto: FindMembersDto
	) {
		return this.membersService.search(findMembersDto);
	}

	@ApiBody(findMembersByIdsBodyOptions)
	@UseGuards(FindMembersGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Post("find-members-by-ids")
	findMembersByIds(
		@Body(new ZodValidationPipe(findMembersByIdsSchema))
		findMembersByIdsDto: FindMembersByIdsDto
	): Promise<Member[]> {
		return this.membersService.findMembersByIds(findMembersByIdsDto);
	}

	@ApiOperation(getMeAndMembersOfMySubRoles)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get("get-me-and-members-of-my-subroles")
	async getMeAndMembersOfMySubRoles() {
		return await this.membersService.getMeAndMembersOfMySubRoles();
	}

	@ApiOperation({ summary: "Find me by token" })
	@UseGuards(FindMeGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get("/me")
	findMe(): Promise<MemberWithoutPassword> {
		return this.membersService.findMe();
	}

	@ApiOperation(verifyMemberOperationOptions)
	@UseGuards(MemberVerificationGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/member-verification")
	memberVerification(@Param("id") id: string): Promise<Member> {
		return this.membersService.memberVerification(id);
	}

	@ApiBody(updateMemberProfileBodyOptions)
	@UseGuards(UpdateMyProfileGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/:id/profile")
	updateProfile(
		@Param("id") id: string,
		@Body(new ZodValidationPipe(updateMemberProfileSchema))
		updateMemberProfileDto: UpdateMemberProfileDto
	): Promise<Member> {
		return this.membersService.updateProfile(id, updateMemberProfileDto);
	}

	@UseGuards(UpdateMyProfileGuard)
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

	@UseGuards(DeleteMemberGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Delete("/:id")
	remove(@Param("id") id: string): Promise<Member> {
		return this.membersService.remove(id);
	}
}
