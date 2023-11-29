import { Module } from "@nestjs/common";
import { MemberServerSettingsService } from "./member-server-settings.service";
import { ServerSettingsController } from "./member-server-settings.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberServerSetting } from "./entities/member-server-setting.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { Member } from "../members/entities/member.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([MemberServerSetting, Member]),
		PermissionsModule,
	],
	controllers: [ServerSettingsController],
	providers: [MemberServerSettingsService ],
})
export class MemberServerSettingsModule { }
