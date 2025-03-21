import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { UtilsModule } from "src/utils/utils.module";

@Module({
	imports: [PrismaModule, UtilsModule],
	controllers: [RolesController],
	providers: [RolesService],
})
export class RolesModule {}
