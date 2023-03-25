import { Module } from '@nestjs/common';
import { ServerSettingsService } from './server-settings.service';
import { ServerSettingsController } from './server-settings.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerSetting } from "./entities/server-setting.entity";
import { PermissionsModule } from "src/permissions/permissions.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([ServerSetting]),
		PermissionsModule
	],
	controllers: [ServerSettingsController],
	providers: [ServerSettingsService],
})
export class ServerSettingsModule { }
