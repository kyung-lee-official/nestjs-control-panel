import {
	Controller,
	Get,
	Body,
	Patch,
	Post,
	Delete,
	Param,
	ParseIntPipe,
} from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import {
	YoutubeDataOverwriteSourceDto,
	youtubeDataOverwriteSourceSchema,
} from "./dto/youtube-data-overwrite-source.dto";
import {
	YouTubeAddTokenDto,
	youtubeAddTokenSchema,
} from "./dto/youtube-add-token.dto";
import {
	YouTubeDataSearchDto,
	youtubeDataSearchSchema,
} from "./dto/youtube-data-search.dto";
import { youtubeDataSearchBodyOptions } from "./swagger/youtube-data-search.swagger";
import {
	youtubeDataUpdateTokenStateBodyOptions,
	youtubeDataUpdateTokenStateOperationOptions,
} from "./swagger/youtube-data-update-token-state.swagger";
import {
	YouTubeDataUpdateTokenStateDto,
	youtubeDataUpdateTokenStateSchema,
} from "./dto/youtube-data-update-token-state.dto";
import {
	UpdateTaskKeywordSearchesByIdDto,
	updateTaskKeywordSearchesByIdSchema,
} from "./dto/update-task-keyword-by-id.dto";

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

	@Get("tokens")
	async getTokens() {
		return await this.youtubeDataCollectorService.getTokens();
	}

	@ApiOperation(youtubeDataUpdateTokenStateOperationOptions)
	@ApiBody(youtubeDataUpdateTokenStateBodyOptions)
	@Patch("update-token-state")
	async updateTokenState(
		@Body(
			"recentlyUsedToken",
			new ZodValidationPipe(youtubeDataUpdateTokenStateSchema)
		)
		youtubeDataUpdateTokenStateDto: YouTubeDataUpdateTokenStateDto
	) {
		return await this.youtubeDataCollectorService.updateTokenState(
			youtubeDataUpdateTokenStateDto
		);
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

	@Get("source")
	async getSource() {
		return await this.youtubeDataCollectorService.getSource();
	}

	@Post("create-task")
	async createTask() {
		return await this.youtubeDataCollectorService.createTask();
	}

	@Get("tasks")
	async getTasks() {
		return await this.youtubeDataCollectorService.getTasks();
	}

	@Get("get-task-by-id/:taskId")
	async getTaskById(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.getTaskById(taskId);
	}

	@Get("get-task-keyword-by-id/:keywordId")
	async getTaskKeywordById(
		@Param("keywordId", ParseIntPipe) keywordId: number
	) {
		return await this.youtubeDataCollectorService.getTaskKeywordById(
			keywordId
		);
	}

	// @Patch("update-task-keyword-searches-by-id")
	// async updateTaskKeywordSearchesById(
	// 	@Body(new ZodValidationPipe(updateTaskKeywordSearchesByIdSchema))
	// 	updateTaskKeywordSearchesByIdDto: UpdateTaskKeywordSearchesByIdDto
	// ) {
	// 	return await this.youtubeDataCollectorService.updateTaskKeywordSearchesById(
	// 		updateTaskKeywordSearchesByIdDto
	// 	);
	// }

	// @ApiBody(youtubeDataSearchBodyOptions)
	// @Post("search")
	// async search(
	// 	@Body(new ZodValidationPipe(youtubeDataSearchSchema))
	// 	youTubeSearchDto: YouTubeDataSearchDto
	// ) {
	// 	return await this.youtubeDataCollectorService.search(youTubeSearchDto);
	// }

	// @Post("abort")
	// abort() {
	// 	return this.youtubeDataCollectorService.abort();
	// }

	// @Delete(":id")
	// remove(@Param("id") id: string) {
	// 	return this.youtubeDataCollectorService.remove(+id);
	// }
}
