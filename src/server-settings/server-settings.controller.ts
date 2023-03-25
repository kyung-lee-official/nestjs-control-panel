import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServerSettingsService } from './server-settings.service';
import { CreateServerSettingDto } from './dto/create-server-setting.dto';
import { UpdateServerSettingDto } from './dto/update-server-setting.dto';
import { ServerSetting } from "./entities/server-setting.entity";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('server-settings')
export class ServerSettingsController {
	constructor(private readonly serverSettingsService: ServerSettingsService) { }

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
	isSignUpAvailable(): Promise<{ isSignUpAvailable: boolean; }> {
		return this.serverSettingsService.isSignUpAvailable();
	}

	@UseGuards(PermissionsGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.GET_SERVER_SETTING)
	@Get()
	findAll(): Promise<ServerSetting> {
		return this.serverSettingsService.findAll();
	}

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	// 	return this.serverSettingsService.findOne(+id);
	// }

	@UseGuards(PermissionsGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.UPDATE_SERVER_SETTING)
	@Patch()
	update(@Body() updateServerSettingDto: UpdateServerSettingDto) {
		return this.serverSettingsService.update(updateServerSettingDto);
	}

	// @Delete(':id')
	// remove(@Param('id') id: string) {
	// 	return this.serverSettingsService.remove(+id);
	// }
}
