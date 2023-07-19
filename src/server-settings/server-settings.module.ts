import { Module } from "@nestjs/common";
import { ServerSettingsService } from "./server-settings.service";
import { ServerSettingsController } from "./server-settings.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerSetting } from "./entities/server-setting.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { User } from "src/users/entities/user.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([ServerSetting, User]),
		PermissionsModule,
	],
	controllers: [ServerSettingsController],
	providers: [ServerSettingsService],
})
export class ServerSettingsModule {}
