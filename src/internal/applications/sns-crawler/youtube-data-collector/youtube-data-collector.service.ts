import { Injectable } from "@nestjs/common";
import { YoutubeDataOverwriteSourceDto } from "./dto/youtube-data-overwrite-source.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class YoutubeDataCollectorService {
	constructor(private readonly prismaService: PrismaService) {}

	async overwriteSource(
		youtubeDataOverwriteSourceDto: YoutubeDataOverwriteSourceDto
	) {
		await this.prismaService.youTubeVideoInfoSearchKeyword.deleteMany();
		return await this.prismaService.youTubeVideoInfoSearchKeyword.createMany(
			{
				data: youtubeDataOverwriteSourceDto,
			}
		);
	}

	async getSource() {
		return await this.prismaService.youTubeVideoInfoSearchKeyword.findMany();
	}

	remove(id: number) {
		return `This action removes a #${id} youtubeDataCollector`;
	}
}
