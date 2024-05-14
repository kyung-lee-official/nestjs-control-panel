import { Module } from "@nestjs/common";
import { MemberServerSettingsService } from "./member-server-settings.service";
import { ServerSettingsController } from "./member-server-settings.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule, PermissionsModule],
	controllers: [ServerSettingsController],
	providers: [MemberServerSettingsService],
})
export class MemberServerSettingsModule {}
