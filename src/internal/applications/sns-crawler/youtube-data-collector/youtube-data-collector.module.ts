import { Module } from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { YoutubeDataCollectorController } from "./youtube-data-collector.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [YoutubeDataCollectorController],
	providers: [YoutubeDataCollectorService],
})
export class YoutubeDataCollectorModule {}
