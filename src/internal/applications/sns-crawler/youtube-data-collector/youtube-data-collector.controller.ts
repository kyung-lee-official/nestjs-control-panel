import {
	Controller,
	Get,
	Body,
	Patch,
	Post,
	Delete,
	Param,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { YoutubeDataCollectorService } from "./youtube-data-collector.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
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
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
import { SnsCrawlerGuard } from "../guards/sns-crawler.guard";

@ApiTags("Youtube Data Collector")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("internal/applications/youtube-data-collector")
export class YoutubeDataCollectorController {
	constructor(
		private readonly youtubeDataCollectorService: YoutubeDataCollectorService
	) {}

	@ApiOperation({
		summary: "Get my permissions of SNS Crawler",
	})
	@Get("permissions")
	async permissions() {
		return await this.youtubeDataCollectorService.permissions();
	}

	@UseGuards(SnsCrawlerGuard)
	@Post("token")
	async addToken(
		@Body(new ZodValidationPipe(youtubeAddTokenSchema))
		youtubeAddTokenDto: YouTubeAddTokenDto
	) {
		return await this.youtubeDataCollectorService.addToken(
			youtubeAddTokenDto
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("tokens")
	async getTokens() {
		return await this.youtubeDataCollectorService.getTokens();
	}

	@UseGuards(SnsCrawlerGuard)
	@Patch("mark-token-as-available/:token")
	async markTokenAsAvailable(@Param("token") token: string) {
		return await this.youtubeDataCollectorService.markTokenAsAvailable(
			token
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Delete(":token")
	async deleteToken(@Param("token") token: string) {
		return await this.youtubeDataCollectorService.deleteToken(token);
	}

	@UseGuards(SnsCrawlerGuard)
	@Patch("overwrite-source")
	async overwriteSource(
		@Body(new ZodValidationPipe(youtubeDataOverwriteSourceSchema))
		youtubeDataOverwriteSourceDto: YoutubeDataOverwriteSourceDto
	) {
		return await this.youtubeDataCollectorService.overwriteSource(
			youtubeDataOverwriteSourceDto
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("source")
	async getSource() {
		return await this.youtubeDataCollectorService.getSource();
	}

	@UseGuards(SnsCrawlerGuard)
	@Post("create-task")
	async createTask() {
		return await this.youtubeDataCollectorService.createTask();
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("tasks")
	async getTasks() {
		return await this.youtubeDataCollectorService.getTasks();
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("get-task-by-id/:taskId")
	async getTaskById(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.getTaskById(taskId);
	}

	@UseGuards(SnsCrawlerGuard)
	@Delete("delete-task-by-id/:taskId")
	async deleteTaskById(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.deleteTaskById(taskId);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("get-task-keyword-by-id/:keywordId")
	async getTaskKeywordById(
		@Param("keywordId", ParseIntPipe) keywordId: number
	) {
		return await this.youtubeDataCollectorService.getTaskKeywordById(
			keywordId
		);
	}

	@ApiBody(youtubeDataGetSearchesBodyOptions)
	@UseGuards(SnsCrawlerGuard)
	@Post("get-searches-by-task-id-and-keyword")
	async getSearchesByTaskIdAndKeyword(
		@Body(new ZodValidationPipe(youtubeDataGetSearchesSchema))
		youtubeDataGetSearchesDto: YouTubeDataGetSearchesDto
	) {
		return await this.youtubeDataCollectorService.getSearchesByTaskIdAndKeyword(
			youtubeDataGetSearchesDto
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("fetch-channels-by-task-id/:taskId")
	async fetchYouTubeChannelsByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.fetchYouTubeChannelsByTaskId(
			taskId
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("get-channels-by-task-id/:taskId")
	async getYouTubeChannelsByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.getYouTubeChannelsByTaskId(
			taskId
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("fetch-videos-by-task-id/:taskId")
	async fetchYouTubeVideosByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.fetchYouTubeVideosByTaskId(
			taskId
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("get-videos-by-task-id/:taskId")
	async getYouTubeVideosByTaskId(
		@Param("taskId", ParseIntPipe) taskId: number
	) {
		return await this.youtubeDataCollectorService.getYouTubeVideosByTaskId(
			taskId
		);
	}

	@ApiOperation(youtubeDataStartTaskByIdOperationOptions)
	@UseGuards(SnsCrawlerGuard)
	@Post("start-task-by-id")
	async startTaskById(
		@Body(new ZodValidationPipe(youtubeDataSearchSchema))
		youtubeDataSearchDto: YouTubeDataSearchDto
	) {
		return await this.youtubeDataCollectorService.startTaskById(
			youtubeDataSearchDto
		);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("meta")
	async getMeta() {
		return await this.youtubeDataCollectorService.getMeta();
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("get-composite-data-by-task-id/:taskId")
	async getCompositeData(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.youtubeDataCollectorService.getCompositeData(taskId);
	}

	@UseGuards(SnsCrawlerGuard)
	@Get("test-youtube-api")
	async testYoutubeApi() {
		return await this.youtubeDataCollectorService.testYoutubeApi();
	}

	@UseGuards(SnsCrawlerGuard)
	@Post("abort-task")
	abort() {
		return this.youtubeDataCollectorService.abort();
	}
}
