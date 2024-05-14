import { Controller, Get, Body, Patch, UseGuards } from "@nestjs/common";
import { MemberServerSettingsService } from "./member-server-settings.service";
import { UpdateMemberServerSettingDto } from "./dto/update-member-server-setting.dto";
import { PermissionsGuard } from "../permissions/guards/permissions.guard";
import { RequiredPermissions } from "../permissions/decorators/required-permissions.decorator";
import { Permissions } from "../permissions/permissions.enum";
import { JwtAuthGuard } from "../member-auth/guards/jwt-auth.guard";
import { IsVerifiedGuard } from "../members/guards/is-verified.guard";
import { MemberServerSetting } from "@prisma/client";

@Controller("member-server-settings")
export class ServerSettingsController {
	constructor(
		private readonly serverSettingsService: MemberServerSettingsService
	) {}

	/**
	 * !!! Danger, test only !!!
	 * Create a new server setting
	 * @param createServerSettingDto
	 * @returns server settings
	 */
	// @Post()
	// create(@Body() createServerSettingDto: CreateServerSettingDto) {
	// 	return this.serverSettingsService.create(createServerSettingDto);
	// }

	@Get("/isSignUpAvailable")
	isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean }> {
		return this.serverSettingsService.isSignUpAvailable();
	}

	@Get("/isGoogleSignInAvailable")
	isGoogleSignInAvailable(): Promise<{ isGoogleSignInAvailable: boolean }> {
		return this.serverSettingsService.isGoogleSignInAvailable();
	}

	@UseGuards(PermissionsGuard)
	@UseGuards(IsVerifiedGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.GET_MEMBER_SERVER_SETTING)
	@Get()
	findAll(): Promise<MemberServerSetting> {
		return this.serverSettingsService.findAll();
	}

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	// 	return this.serverSettingsService.findOne(+id);
	// }

	@UseGuards(PermissionsGuard)
	@UseGuards(IsVerifiedGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.UPDATE_MEMBER_SERVER_SETTING)
	@Patch()
	update(@Body() updateServerSettingDto: UpdateMemberServerSettingDto) {
		return this.serverSettingsService.update(updateServerSettingDto);
	}

	// @Delete(':id')
	// remove(@Param('id') id: string) {
	// 	return this.serverSettingsService.remove(+id);
	// }
}
