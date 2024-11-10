import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	UseGuards,
	UseInterceptors,
	HttpCode,
	Delete,
} from "@nestjs/common";
import { MemberRolesService } from "./member-roles.service";
import { CreateMemberRoleGuard } from "./guards/create-member-role.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExcludePasswordInterceptor } from "../../interceptors/exclude-password.interceptor";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import {
	findMemberRolesByIdsOperationOptions,
	findMembersRolesByIdsBodyOptions,
} from "./swagger/find-member-roles.swagger";
import { FindMemberRolesByIdsGuard } from "./guards/find-member-roles-by-ids.guard";
import {
	FindMemberRolesByIdsDto,
	findMemberRolesByIdsSchema,
} from "./dto/find-member-roles-by-ids.dto";
import {
	UpdateMemberRoleByIdDto,
	updateMemberRoleByIdSchema,
} from "./dto/update-member-role-by-id.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { FindMemberRoleByIdGuard } from "./guards/find-member-role-by-id.guard";
import { UpdateMemberRoleByIdGuard } from "./guards/update-member-role-by-id.guard";
import { RemoveMemberRoleByIdGuard } from "./guards/remove-member-role-by-id.guard";

@ApiTags("Member Roles")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("member-roles")
export class MemberRolesController {
	constructor(private readonly memberRolesService: MemberRolesService) {}

	@ApiOperation({ summary: "Create member role" })
	@UseGuards(CreateMemberRoleGuard)
	@Post()
	create() {
		return this.memberRolesService.create();
	}

	@ApiOperation(findMemberRolesByIdsOperationOptions)
	@ApiBody(findMembersRolesByIdsBodyOptions)
	@UseGuards(FindMemberRolesByIdsGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("/find-member-roles-by-ids")
	findMemberRolesByIds(
		@Body(new ZodValidationPipe(findMemberRolesByIdsSchema))
		findMemberRolesByIdsDto: FindMemberRolesByIdsDto
	) {
		return this.memberRolesService.findMemberRolesByIds(
			findMemberRolesByIdsDto
		);
	}

	@UseGuards(FindMemberRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get(":id")
	findMemberRoleById(@Param("id") id: string) {
		return this.memberRolesService.findMemberRoleById(id);
	}

	@UseGuards(UpdateMemberRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch(":id")
	updateMemberRoleById(
		@Param("id") id: string,
		@Body(new ZodValidationPipe(updateMemberRoleByIdSchema))
		updateMemberRoleDto: UpdateMemberRoleByIdDto
	) {
		return this.memberRolesService.updateMemberRoleById(
			id,
			updateMemberRoleDto
		);
	}

	@UseGuards(RemoveMemberRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.memberRolesService.remove(id);
	}
}
