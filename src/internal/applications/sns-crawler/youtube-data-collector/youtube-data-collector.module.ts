import { Module } from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { YoutubeDataCollectorController } from "./youtube-data-collector.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
	imports: [PrismaService],
	controllers: [YoutubeDataCollectorController],
	providers: [YoutubeDataCollectorService],
})
export class YoutubeDataCollectorModule {}
