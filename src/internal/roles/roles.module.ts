import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [RolesController],
	providers: [RolesService],
})
export class RolesModule {}
