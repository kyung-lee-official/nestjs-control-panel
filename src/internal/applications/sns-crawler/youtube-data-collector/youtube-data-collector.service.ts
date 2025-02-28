import { Injectable } from "@nestjs/common";
import { YoutubeDataOverwriteSourceDto } from "./dto/youtube-data-overwrite-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { YouTubeAddTokenDto } from "./dto/youtube-add-token.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class YoutubeDataCollectorService {
	constructor(private readonly prismaService: PrismaService) {}

	async addToken(youtubeAddTokenDto: YouTubeAddTokenDto) {
		return await this.prismaService.youTubeToken.create({
			data: {
				token: youtubeAddTokenDto.token,
				quotaRunOutAt: Prisma.skip,
			},
		});
	}

	async getToken() {
		return await this.prismaService.youTubeToken.findMany();
	}

	async deleteToken(token: string) {
		return await this.prismaService.youTubeToken.delete({
			where: {
				token: token,
			},
		});
	}

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
