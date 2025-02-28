import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import {
	YoutubeDataOverwriteSourceDto,
	youtubeDataOverwriteSourceSchema,
} from "./dto/youtube-data-overwrite-source.dto";

@ApiTags("Youtube Data Collector")
@Controller("youtube-data-collector")
export class YoutubeDataCollectorController {
	constructor(
		private readonly youtubeDataCollectorService: YoutubeDataCollectorService
	) {}

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
