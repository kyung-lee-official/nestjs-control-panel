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

import {
	YouTubeDataGetSearchesDto,
	youtubeDataGetSearchesSchema,
} from "./dto/youtube-data-get-searches.dto";
import { youtubeDataGetSearchesBodyOptions } from "./swagger/youtube-data-get-searches.swagger";
import { youtubeDataStartTaskByIdOperationOptions } from "./swagger/youtube-data-start-task-by-id.swagger";

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

	// @ApiOperation(youtubeDataUpdateTokenStateOperationOptions)
	// @ApiBody(youtubeDataUpdateTokenStateBodyOptions)
	// @Patch("update-token-state")
	// async updateTokenState(
	// 	@Body(
	// 		"recentlyUsedToken",
	// 		new ZodValidationPipe(youtubeDataUpdateTokenStateSchema)
	// 	)
	// 	youtubeDataUpdateTokenStateDto: YouTubeDataUpdateTokenStateDto
	// ) {
	// 	return await this.youtubeDataCollectorService.updateTokenState(
	// 		youtubeDataUpdateTokenStateDto
	// 	);
	// }

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

	@Delete("delete-task-by-id/:taskId")
	async deleteTaskById(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.deleteTaskById(taskId);
	}

	@Get("get-task-keyword-by-id/:keywordId")
	async getTaskKeywordById(
		@Param("keywordId", ParseIntPipe) keywordId: number
	) {
		return await this.youtubeDataCollectorService.getTaskKeywordById(
			keywordId
		);
	}

	@ApiBody(youtubeDataGetSearchesBodyOptions)
	@Post("get-searches-by-task-id-and-keyword")
	async getSearchesByTaskIdAndKeyword(
		@Body(new ZodValidationPipe(youtubeDataGetSearchesSchema))
		youtubeDataGetSearchesDto: YouTubeDataGetSearchesDto
	) {
		return await this.youtubeDataCollectorService.getSearchesByTaskIdAndKeyword(
			youtubeDataGetSearchesDto
		);
	}

	@Get("fetch-channels-by-task-id/:taskId")
	async fetchYouTubeChannelsByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.fetchYouTubeChannelsByTaskId(
			taskId
		);
	}

	@Get("get-channels-by-task-id/:taskId")
	async getYouTubeChannelsByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.getYouTubeChannelsByTaskId(
			taskId
		);
	}

	@Get("fetch-videos-by-task-id/:taskId")
	async fetchYouTubeVideosByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.fetchYouTubeVideosByTaskId(
			taskId
		);
	}

	@Get("get-videos-by-task-id/:taskId")
	async getYouTubeVideosByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.getYouTubeVideosByTaskId(
			taskId
		);
	}

	@ApiOperation(youtubeDataStartTaskByIdOperationOptions)
	@Post("start-task-by-id")
	async startTaskById(
		@Body(new ZodValidationPipe(youtubeDataSearchSchema))
		youtubeDataSearchDto: YouTubeDataSearchDto
	) {
		return await this.youtubeDataCollectorService.startTaskById(
			youtubeDataSearchDto
		);
	}

	@Get("meta")
	async getMeta() {
		return await this.youtubeDataCollectorService.getMeta();
	}

	@Get("get-composite-data-by-task-id/:taskId")
	async getCompositeData(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.getCompositeData(taskId);
	}

	@Get("test-youtube-api")
	async testYoutubeApi() {
		return await this.youtubeDataCollectorService.testYoutubeApi();
	}

	@Post("abort")
	abort() {
		return this.youtubeDataCollectorService.abort();
	}
}
