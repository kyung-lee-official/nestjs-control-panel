import {
	Controller,
	Get,
	Body,
	Patch,
	Post,
	Delete,
	Param,
} from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import {
	YoutubeDataOverwriteSourceDto,
	youtubeDataOverwriteSourceSchema,
} from "./dto/youtube-data-overwrite-source.dto";
import {
	YouTubeAddTokenDto,
	youtubeAddTokenSchema,
} from "./dto/youtube-add-token.dto";

@ApiTags("Youtube Data Collector")
@Controller("internal/applications/youtube-data-collector")
export class YoutubeDataCollectorController {
	constructor(
		private readonly youtubeDataCollectorService: YoutubeDataCollectorService
	) {}

	@Post("token")
	async addToken(
		@Body(new ZodValidationPipe(youtubeAddTokenSchema))
		youtubeAddTokenDto: YouTubeAddTokenDto
	) {
		return await this.youtubeDataCollectorService.addToken(
			youtubeAddTokenDto
		);
	}

	@Get("token")
	async getToken() {
		return await this.youtubeDataCollectorService.getToken();
	}

	@Delete(":token")
	async deleteToken(@Param("token") token: string) {
		return await this.youtubeDataCollectorService.deleteToken(token);
	}

	@Patch("overwrite-source")
	async overwriteSource(
		@Body(new ZodValidationPipe(youtubeDataOverwriteSourceSchema))
		youtubeDataOverwriteSourceDto: YoutubeDataOverwriteSourceDto
	) {
		return await this.youtubeDataCollectorService.overwriteSource(
			youtubeDataOverwriteSourceDto
		);
	}

	@Get()
	async getSource() {
		return await this.youtubeDataCollectorService.getSource();
	}

	// @Patch(":id")
	// update(
	// 	@Param("id") id: string,
	// 	@Body() updateYoutubeDataCollectorDto: UpdateYoutubeDataCollectorDto
	// ) {
	// 	return this.youtubeDataCollectorService.update(
	// 		+id,
	// 		updateYoutubeDataCollectorDto
	// 	);
	// }

	// @Delete(":id")
	// remove(@Param("id") id: string) {
	// 	return this.youtubeDataCollectorService.remove(+id);
	// }
}
