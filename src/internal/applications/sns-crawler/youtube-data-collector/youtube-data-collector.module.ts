import { Module } from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { YoutubeDataCollectorController } from "./youtube-data-collector.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [YoutubeDataCollectorController],
	providers: [YoutubeDataCollectorService],
})
export class YoutubeDataCollectorModule {}
