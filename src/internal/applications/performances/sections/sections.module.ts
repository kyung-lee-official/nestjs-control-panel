import { Module } from "@nestjs/common";
import { SectionsService } from "./sections.service";
import { SectionsController } from "./sections.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [SectionsController],
	providers: [SectionsService],
	exports: [SectionsService],
})
export class SectionsModule {}
