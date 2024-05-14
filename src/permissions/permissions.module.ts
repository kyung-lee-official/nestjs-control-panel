import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { PermissionsGuard } from "./guards/permissions.guard";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [PermissionsController],
	providers: [PermissionsService, PermissionsGuard],
	exports: [PermissionsService],
})
export class PermissionsModule {}
