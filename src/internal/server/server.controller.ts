import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	UseInterceptors,
	UsePipes,
	UseGuards,
} from "@nestjs/common";
import { ServerService } from "./server.service";
import { SeedServerDto, seedServerSchema } from "./dto/seed-server.dto";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import {
	seedServerBadRequestResponseOptions,
	seedServerBodyOptions,
	seedServerOkResponseOptions,
	seedServerOperationOptions,
} from "./swagger/seed-server.swagger";
import { ExcludePasswordInterceptor } from "src/interceptors/exclude-password.interceptor";
import {
	isSeededOkResponseOptions,
	isSeededOperationOptions,
} from "./swagger/is-seeded.swagger";
import { JwtGuard } from "../authentication/guards/jwt.guard";
import { UpdateServerSettingsGuard } from "./guards/update-server-settings.guard";
import { UpdateServerSettingsDto } from "./dto/update-server-settings.dto";
import { updateServerSettingsBodyOptions } from "./swagger/update-server-settings.swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { IsVerifiedGuard } from "../authentication/guards/is-verified.guard";
import {
	getPermissionsOkResponseOptions,
	getPermissionsOperationOptions,
} from "./swagger/get-permissions.swagger";

@ApiTags("Server")
@Controller("internal/server")
export class ServerController {
	constructor(private readonly serverService: ServerService) {}

	@ApiBearerAuth()
	@ApiOperation(getPermissionsOperationOptions)
	@ApiOkResponse(getPermissionsOkResponseOptions)
	@UseGuards(JwtGuard)
	@Get("permissions")
	permissions() {
		return this.serverService.permissions();
	}

	@ApiOperation(seedServerOperationOptions)
	@ApiBadRequestResponse(seedServerBadRequestResponseOptions)
	@ApiBody(seedServerBodyOptions)
	@ApiOkResponse(seedServerOkResponseOptions)
	@UsePipes(new ZodValidationPipe(seedServerSchema))
	@UseInterceptors(ExcludePasswordInterceptor)
	@Post("seed")
	async seed(@Body() seedServerDto: SeedServerDto) {
		return await this.serverService.seed(seedServerDto);
	}

	@ApiOperation(isSeededOperationOptions)
	@ApiOkResponse(isSeededOkResponseOptions)
	@Get("is-seeded")
	async isSeeded(): Promise<{ isSeeded: boolean }> {
		return await this.serverService.isSeeded();
	}

	@Get("is-sign-up-available")
	async isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
		return await this.serverService.isSignUpAvailable();
	}

	@Get("is-google-sign-in-available")
	async isGoogleSignInAvailable(): Promise<{
		isGoogleSignInAvailable: boolean;
	}> {
		return await this.serverService.isGoogleSignInAvailable();
	}

	// @ApiBearerAuth()
	// @UseGuards(JwtGuard, IsVerifiedGuard, GetServerSettingsGuard)
	@Get("settings")
	async getServerSettings() {
		return await this.serverService.getServerSettings();
	}

	@ApiBearerAuth()
	@ApiBody(updateServerSettingsBodyOptions)
	@UseGuards(JwtGuard, UpdateServerSettingsGuard)
	@Patch("settings")
	updateServerSettings(
		@Body() updateServerSettingsDto: UpdateServerSettingsDto
	) {
		return this.serverService.updateServerSettings(updateServerSettingsDto);
	}
}
