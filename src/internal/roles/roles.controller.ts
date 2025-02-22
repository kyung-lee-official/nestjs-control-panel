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
import { RolesService } from "./roles.service";
import { CreateRoleGuard } from "./guards/create-role.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { ExcludePasswordInterceptor } from "../../interceptors/exclude-password.interceptor";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";

import { FindRolesByIdsGuard } from "./guards/find-roles-by-ids.guard";
import {
	FindRolesByIdsDto,
	findRolesByIdsSchema,
} from "./dto/find-roles-by-ids.dto";
import {
	UpdateRoleByIdDto,
	updateRoleByIdSchema,
} from "./dto/update-role-by-id.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { FindRoleByIdGuard } from "./guards/find-role-by-id.guard";
import { UpdateRoleByIdGuard } from "./guards/update-role-by-id.guard";
import { RemoveRoleByIdGuard } from "./guards/remove-role-by-id.guard";
import {
	findRolesByIdsBodyOptions,
	findRolesByIdsOperationOptions,
} from "./swagger/find-roles-by-ids.swagger";
import {
	createRoleBodyOptions,
	createRoleOperationOptions,
} from "./swagger/create-role.swagger";
import { CreateRoleDto, createRoleSchema } from "./dto/create-role.dto";
import {
	findRoleByIdParamOptions,
	findRoleByIdOperationOptions,
} from "./swagger/find-role-by-id.swagger";
import {
	deleteRoleOperationOptions,
	deleteRoleParamsOptions,
} from "./swagger/delete-role-by-id.swagger";
import { getallRolesOperationOptions } from "./swagger/get-all-roles.swagger";
import {
	udpateRoleByIdBodyOptions,
	updateRoleByIdOperationOptions,
} from "./swagger/update-role-by-id.swagger";

@ApiTags("Roles")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/roles")
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@ApiBearerAuth()
	@ApiOperation({ summary: "Get roles permissions" })
	@UseGuards(JwtGuard)
	@Get("permissions")
	async permissions() {
		return await this.rolesService.permissions();
	}

	@ApiOperation(createRoleOperationOptions)
	@ApiBody(createRoleBodyOptions)
	@UseGuards(CreateRoleGuard)
	@Post()
	async create(
		@Body(new ZodValidationPipe(createRoleSchema))
		createRoleDto: CreateRoleDto
	) {
		return await this.rolesService.create(createRoleDto);
	}

	@ApiOperation(getallRolesOperationOptions)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get()
	async getAllRoles() {
		return await this.rolesService.getAllRoles();
	}

	@ApiOperation(findRolesByIdsOperationOptions)
	@ApiBody(findRolesByIdsBodyOptions)
	@UseGuards(FindRolesByIdsGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@HttpCode(200)
	@Post("/find-roles-by-ids")
	findRolesByIds(
		@Body(new ZodValidationPipe(findRolesByIdsSchema))
		findRolesByIdsDto: FindRolesByIdsDto
	) {
		return this.rolesService.findRolesByIds(findRolesByIdsDto);
	}

	@ApiOperation(findRoleByIdOperationOptions)
	@ApiParam(findRoleByIdParamOptions)
	@UseGuards(FindRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Get(":id")
	findRoleById(@Param("id") id: string) {
		return this.rolesService.findRoleById(id);
	}

	@ApiOperation(updateRoleByIdOperationOptions)
	@ApiBody(udpateRoleByIdBodyOptions)
	@UseGuards(UpdateRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch()
	updateRoleById(
		@Body(new ZodValidationPipe(updateRoleByIdSchema))
		updateRoleDto: UpdateRoleByIdDto
	) {
		return this.rolesService.updateRoleById(updateRoleDto);
	}

	@ApiOperation(deleteRoleOperationOptions)
	@ApiParam(deleteRoleParamsOptions)
	@UseGuards(RemoveRoleByIdGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.rolesService.remove(id);
	}
}
