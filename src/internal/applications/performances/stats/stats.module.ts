import { Module } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { StatsController } from "./stats.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [StatsController],
	providers: [StatsService],
})
export class StatsModule {}
