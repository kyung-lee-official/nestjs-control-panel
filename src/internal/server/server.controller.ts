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
import { SeedServerPipe } from "./pipes/seed-server.pipe";
import {
	isSeededOkResponseOptions,
	isSeededOperationOptions,
} from "./swagger/is-seeded.swagger";
import { JwtGuard } from "../authentication/guards/jwt.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import { UpdateServerSettingsGuard } from "./guards/update-server-settings.guard";
import { UpdateServerSettingsDto } from "./dto/update-server-settings.dto";
import { updateServerSettingsBodyOptions } from "./swagger/update-server-settings.swagger";

@ApiTags("Server")
@Controller("server")
export class ServerController {
	constructor(private readonly serverService: ServerService) {}

	@ApiOperation(seedServerOperationOptions)
	@ApiOkResponse(seedServerOkResponseOptions)
	@ApiBadRequestResponse(seedServerBadRequestResponseOptions)
	@ApiBody(seedServerBodyOptions)
	@UsePipes(new SeedServerPipe(seedServerSchema))
	@UseInterceptors(ExcludePasswordInterceptor)
	@Post("seed")
	async seed(@Body() seedServerDto: SeedServerDto) {
		return await this.serverService.seed(seedServerDto);
	}

	@ApiOperation(isSeededOperationOptions)
	@ApiOkResponse(isSeededOkResponseOptions)
	@Get("is-seeded")
	isSeeded(): Promise<{ isSeeded: boolean }> {
		return this.serverService.isSeeded();
	}

	@Get("is-sign-up-available")
	isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
		return this.serverService.isSignUpAvailable();
	}

	@Get("is-google-sign-in-available")
	isGoogleSignInAvailable(): Promise<{ isGoogleSignInAvailable: boolean }> {
		return this.serverService.isGoogleSignInAvailable();
	}

	// @ApiBearerAuth()
	// @UseGuards(JwtGuard, IsVerifiedGuard, GetServerSettingsGuard)
	@Get("settings")
	getServerSettings() {
		return this.serverService.getServerSettings();
	}

	@ApiBearerAuth()
	@ApiBody(updateServerSettingsBodyOptions)
	@UseGuards(JwtGuard, IsVerifiedGuard, UpdateServerSettingsGuard)
	@Patch("settings")
	updateServerSettings(
		@Body() updateServerSettingsDto: UpdateServerSettingsDto
	) {
		return this.serverService.updateServerSettings(updateServerSettingsDto);
	}

	// @Patch(":id")
	// updateServerSettings(@Param("id") id: string, @Body() updateServerDto: UpdateServerDto) {
	// 	return this.serverService.update(+id, updateServerDto);
	// }
}
