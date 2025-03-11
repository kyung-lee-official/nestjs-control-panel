import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { YoutubeDataOverwriteSourceDto } from "./dto/youtube-data-overwrite-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { YouTubeAddTokenDto } from "./dto/youtube-add-token.dto";
import { Prisma, YouTubeDataTaskKeywordStatus } from "@prisma/client";
import { YouTubeDataSearchDto } from "./dto/youtube-data-search.dto";
import { searchKeyword } from "./utils/searchKeyword";
import axios from "axios";
import dayjs from "dayjs";
import { SearchResultStruct } from "./utils/types";
import { YouTubeDataGetSearchesDto } from "./dto/youtube-data-get-searches.dto";
import { getChannelsDetail } from "./utils/getChannelsDetail";
import { getVideosDetail } from "./utils/getVideoDetails";

type Flags = {
	tokenObj: {
		token: string;
		isRecentlyUsed: boolean;
		quotaRunOutAt: Date | null;
	} | null;
	taskId: number | null;
	status:
		| "idle"
		| "fetching-searches"
		| "fetching-channels"
		| "fetching-videos";
	shouldStop: boolean;
	start: string;
	end: string;
	targetResultCount: number;
};

@Injectable()
export class YoutubeDataCollectorService {
	private meta: Flags = {
		tokenObj: null,
		taskId: null,
		status: "idle",
		shouldStop: false,
		start: dayjs().subtract(1, "month").toISOString(),
		end: dayjs().toISOString(),
		targetResultCount: 500,
	};

	constructor(private readonly prismaService: PrismaService) {}

	async addToken(youtubeAddTokenDto: YouTubeAddTokenDto) {
		return await this.prismaService.youTubeDataToken.create({
			data: {
				token: youtubeAddTokenDto.token,
				isRecentlyUsed: false,
				isExpired: false,
				quotaRunOutAt: Prisma.skip,
			},
		});
	}

	async getTokens() {
		const recentlyUsedToken =
			await this.prismaService.youTubeDataToken.findFirst({
				where: {
					isRecentlyUsed: true,
				},
			});
		if (!recentlyUsedToken) {
			const token = await this.prismaService.youTubeDataToken.findFirst();
			if (!token) {
				throw new BadRequestException("No token found.");
			}
			await this.prismaService.youTubeDataToken.update({
				where: {
					token: token.token,
				},
				data: {
					isRecentlyUsed: true,
				},
			});
		}
		return await this.prismaService.youTubeDataToken.findMany();
	}

	/**
	 * Set a valid token to the meta object
	 * @param oldToken optional
	 */
	async setValidToken(oldToken?: {
		token: string;
		isRecentlyUsed: boolean;
		quotaRunOutAt?: Date;
		isExpired: boolean;
	}) {
		if (oldToken) {
			await this.prismaService.youTubeDataToken.update({
				where: {
					token: oldToken.token,
				},
				data: {
					isRecentlyUsed: false,
					quotaRunOutAt: oldToken.quotaRunOutAt || Prisma.skip,
					isExpired: oldToken.isExpired,
				},
			});
		}
		const newToken = await this.prismaService.youTubeDataToken.findFirst({
			where: {
				OR: [
					{ quotaRunOutAt: null },
					{
						quotaRunOutAt: {
							/* youtube data token quota resets every day */
							lte: dayjs().subtract(1, "day").toDate(),
						},
					},
				],
				AND: [
					{
						isExpired: false,
					},
				],
			},
		});
		if (!newToken) {
			throw new BadRequestException("No token available.");
		}
		await this.prismaService.youTubeDataToken.update({
			where: {
				token: newToken.token,
			},
			data: {
				isRecentlyUsed: true,
			},
		});
		this.meta.tokenObj = newToken;
	}

	async deleteToken(token: string) {
		return await this.prismaService.youTubeDataToken.delete({
			where: {
				token: token,
			},
		});
	}

	async overwriteSource(
		youtubeDataOverwriteSourceDto: YoutubeDataOverwriteSourceDto
	) {
		await this.prismaService.youTubeDataSearchKeyword.deleteMany();
		return await this.prismaService.youTubeDataSearchKeyword.createMany({
			data: youtubeDataOverwriteSourceDto,
		});
	}

	async getSource() {
		return await this.prismaService.youTubeDataSearchKeyword.findMany();
	}

	async createTask() {
		const keywords =
			await this.prismaService.youTubeDataSearchKeyword.findMany();
		if (!keywords.length) {
			throw new BadRequestException("No keywords found.");
		}
		const task = await this.prismaService.youTubeDataTask.create({
			data: {
				youTubeDataTaskKeywords: {
					create: keywords.map((k) => {
						return {
							keyword: k.keyword,
							status: YouTubeDataTaskKeywordStatus.PENDING,
						};
					}),
				},
			},
		});
		return task;
	}

	async getTasks() {
		const tasks = await this.prismaService.youTubeDataTask.findMany();
		/* sort by createdAt */
		tasks.sort((a, b) => {
			return b.createdAt.getTime() - a.createdAt.getTime();
		});
		return tasks;
	}

	async getTaskById(taskId: number) {
		return await this.prismaService.youTubeDataTask.findUnique({
			where: {
				id: taskId,
			},
			include: {
				youTubeDataTaskKeywords: true,
			},
		});
	}

	async deleteTaskById(taskId: number) {
		/* delete associated videos */
		await this.prismaService.youTubeDataApiVideo.deleteMany({
			where: {
				youTubeDataTaskId: taskId,
			},
		});
		/* delete associated channels */
		await this.prismaService.youTubeDataApiChannel.deleteMany({
			where: {
				youTubeDataTaskId: taskId,
			},
		});
		/* delete associated searches */
		await this.prismaService.youTubeDataApiSearch.deleteMany({
			where: {
				youTubeDataTaskId: taskId,
			},
		});
		/* delete associated keywords */
		await this.prismaService.youTubeDataTaskKeyword.deleteMany({
			where: {
				taskId: taskId,
			},
		});
		/* delete task */
		return await this.prismaService.youTubeDataTask.delete({
			where: {
				id: taskId,
			},
		});
	}

	async getTaskKeywordById(keywordId: number) {
		return await this.prismaService.youTubeDataTaskKeyword.findUnique({
			where: {
				id: keywordId,
			},
		});
	}

	async getSearchesByTaskIdAndKeyword(
		youtubeDataGetSearchesDto: YouTubeDataGetSearchesDto
	) {
		const searches = await this.prismaService.youTubeDataApiSearch.findMany(
			{
				where: {
					youTubeDataTaskId: youtubeDataGetSearchesDto.taskId,
					keyword: youtubeDataGetSearchesDto.keyword,
				},
			}
		);
		return searches;
	}

	async fetchYouTubeChannelsByTaskId(taskId: number) {
		await this.setValidToken();
		this.meta = {
			tokenObj: this.meta.tokenObj,
			taskId: taskId,
			status: "fetching-channels",
			shouldStop: false,
			start: this.meta.start,
			end: this.meta.end,
			targetResultCount: 0,
		};
		if (this.meta.status === "fetching-searches") {
			return this.meta;
		} else {
			this.meta.taskId = taskId;
			this.meta.status = "fetching-searches";
		}
		if (!this.meta.tokenObj) {
			throw new BadRequestException("Please provide a token");
		}
		/* clear old data */
		const oldChannels =
			await this.prismaService.youTubeDataApiChannel.deleteMany({
				where: {
					youTubeDataTaskId: taskId,
				},
			});
		const task = await this.prismaService.youTubeDataTask.findUnique({
			where: {
				id: taskId,
			},
			include: {
				searches: {
					select: {
						channelId: true,
					},
				},
			},
		});
		if (!task) {
			throw new NotFoundException("Task not found.");
		}
		const channelIds = task.searches.map((s) => s.channelId);
		/* remove duplicate channels */
		const uniqueChannelIds = channelIds.filter((channelId, index, self) => {
			return self.indexOf(channelId) === index;
		});
		try {
			const channelsInfo = await getChannelsDetail(
				this.meta.tokenObj.token,
				uniqueChannelIds
			);
			const dbChannels =
				await this.prismaService.youTubeDataApiChannel.createMany({
					data: channelsInfo.map((c) => {
						return {
							channelId: c.channelId,
							channelTitle: c.channelTitle,
							viewCount: c.viewCount,
							subscriberCount: c.subscriberCount,
							videoCount: c.videoCount,
							youTubeDataTaskId: taskId,
						};
					}),
				});
			this.meta.taskId = null;
			this.meta.status = "idle";
		} catch (error: any) {
			if (axios.isAxiosError(error)) {
				/* possible reason: proxy down */
				if (error.code === "ECONNABORTED") {
					console.error("Request timed out:", error.message);
				} else if (error.response) {
					if (
						error.response.data.error.message ===
						"API key expired. Please renew the API key."
					) {
						await this.setValidToken({
							token: this.meta.tokenObj.token,
							isRecentlyUsed: false,
							isExpired: true,
						});
					}
					if (
						error.response.data.error.errors.some(
							(err) => err.reason === "quotaExceeded"
						)
					) {
						await this.setValidToken({
							token: this.meta.tokenObj.token,
							isRecentlyUsed: false,
							quotaRunOutAt: dayjs().toDate(),
							isExpired: false,
						});
					}
				}
			} else {
				console.error(error);
			}
		}
	}

	async getYouTubeChannelsByTaskId(taskId: number) {
		const channels =
			await this.prismaService.youTubeDataApiChannel.findMany({
				where: {
					youTubeDataTaskId: taskId,
				},
			});
		const stringifiedChannels = channels.map((c) => {
			return {
				id: c.id,
				channelId: c.channelId,
				channelTitle: c.channelTitle,
				viewCount: c.viewCount.toString(),
				subscriberCount: c.subscriberCount.toString(),
				videoCount: c.videoCount.toString(),
			};
		});
		return stringifiedChannels;
	}

	async fetchYouTubeVideosByTaskId(taskId: number) {
		await this.setValidToken();
		this.meta = {
			tokenObj: this.meta.tokenObj,
			taskId: taskId,
			status: "fetching-videos",
			shouldStop: false,
			start: this.meta.start,
			end: this.meta.end,
			targetResultCount: 0,
		};
		if (this.meta.status === "fetching-searches") {
			return this.meta;
		} else {
			this.meta.taskId = taskId;
			this.meta.status = "fetching-searches";
		}
		if (!this.meta.tokenObj) {
			throw new BadRequestException("Please provide a token");
		}
		/* clear old data */
		const oldVideos =
			await this.prismaService.youTubeDataApiVideo.deleteMany({
				where: {
					youTubeDataTaskId: taskId,
				},
			});
		const task = await this.prismaService.youTubeDataTask.findUnique({
			where: {
				id: taskId,
			},
			include: {
				searches: {
					select: {
						videoId: true,
					},
				},
			},
		});
		if (!task) {
			throw new NotFoundException("Task not found.");
		}
		const videoIds = task.searches.map((s) => s.videoId);
		/* remove duplicate videos */
		const uniqueVideoIds = videoIds.filter((videoId, index, self) => {
			return self.indexOf(videoId) === index;
		});
		try {
			const videosInfo = await getVideosDetail(
				this.meta.tokenObj.token,
				uniqueVideoIds
			);
			const dbVideos =
				await this.prismaService.youTubeDataApiVideo.createMany({
					data: videosInfo.map((v) => {
						return {
							videoId: v.videoId,
							title: v.title,
							description: v.description,
							durationAsSeconds: v.durationAsSeconds,
							viewCount: v.viewCount,
							likeCount: v.likeCount,
							favoriteCount: v.favoriteCount,
							commentCount: v.commentCount,
							youTubeDataTaskId: taskId,
						};
					}),
				});
			this.meta.taskId = null;
			this.meta.status = "idle";
		} catch (error: any) {
			if (axios.isAxiosError(error)) {
				/* possible reason: proxy down */
				if (error.code === "ECONNABORTED") {
					console.error("Request timed out:", error.message);
				} else if (error.response) {
					if (
						error.response.data.error.message ===
						"API key expired. Please renew the API key."
					) {
						await this.setValidToken({
							token: this.meta.tokenObj.token,
							isRecentlyUsed: false,
							isExpired: true,
						});
					}
					if (
						error.response.data.error.errors.some(
							(err) => err.reason === "quotaExceeded"
						)
					) {
						await this.setValidToken({
							token: this.meta.tokenObj.token,
							isRecentlyUsed: false,
							quotaRunOutAt: dayjs().toDate(),
							isExpired: false,
						});
					}
				}
			} else {
				console.error(error);
			}
		}
	}

	async getYouTubeVideosByTaskId(taskId: number) {
		const videos = await this.prismaService.youTubeDataApiVideo.findMany({
			where: {
				youTubeDataTaskId: taskId,
			},
		});
		const stringifiedVideos = videos.map((v) => {
			return {
				id: v.id,
				videoId: v.videoId,
				title: v.title,
				description: v.description,
				durationAsSeconds: v.durationAsSeconds,
				viewCount: v.viewCount.toString(),
				likeCount: v.likeCount.toString(),
				favoriteCount: v.favoriteCount.toString(),
				commentCount: v.commentCount.toString(),
			};
		});
		return stringifiedVideos;
	}

	async startTaskById(youtubeDataSearchDto: YouTubeDataSearchDto) {
		const { taskId, start, end, targetResultCount } = youtubeDataSearchDto;
		await this.setValidToken();
		this.meta = {
			tokenObj: this.meta.tokenObj,
			taskId: taskId,
			status: "idle",
			shouldStop: false,
			start: start,
			end: end,
			targetResultCount: targetResultCount,
		};
		if (this.meta.status !== "idle") {
			return this.meta;
		} else {
			this.meta.status = "fetching-searches";
		}
		if (!this.meta.taskId) {
			throw new BadRequestException("Please provide a task id");
		}
		const keywords =
			await this.prismaService.youTubeDataTaskKeyword.findMany({
				where: {
					taskId: this.meta.taskId,
					OR: [
						{
							status: YouTubeDataTaskKeywordStatus.PENDING,
						},
						{
							status: YouTubeDataTaskKeywordStatus.FAILED,
						},
					],
				},
			});
		for (const keyword of keywords) {
			if (this.meta.shouldStop) {
				this.meta.taskId = null;
				this.meta.status = "idle";
				this.meta.shouldStop = false;
				return this.meta;
			}
			if (!this.meta.tokenObj) {
				throw new BadRequestException("Please provide a token");
			}
			let searches: SearchResultStruct[] = [];
			try {
				searches = await searchKeyword(
					this.meta.tokenObj.token,
					keyword.keyword,
					this.meta.start,
					this.meta.end,
					this.meta.targetResultCount
				);
			} catch (error: any) {
				if (axios.isAxiosError(error)) {
					/* possible reason: proxy down */
					if (error.code === "ECONNABORTED") {
						console.error("Request timed out:", error.message);
					} else if (error.response) {
						if (
							error.response.data.error.message ===
							"API key expired. Please renew the API key."
						) {
							await this.setValidToken({
								token: this.meta.tokenObj.token,
								isRecentlyUsed: false,
								isExpired: true,
							});
						}
						if (
							error.response.data.error.errors.some(
								(err) => err.reason === "quotaExceeded"
							)
						) {
							await this.setValidToken({
								token: this.meta.tokenObj.token,
								isRecentlyUsed: false,
								quotaRunOutAt: dayjs().toDate(),
								isExpired: false,
							});
						}
					}
				} else {
					console.error(error);
				}
				const dbKeyword =
					await this.prismaService.youTubeDataTaskKeyword.update({
						where: {
							id: keyword.id,
						},
						data: {
							status: YouTubeDataTaskKeywordStatus.FAILED,
						},
					});
				continue;
			}
			const dbKeyword =
				await this.prismaService.youTubeDataTaskKeyword.update({
					where: {
						id: keyword.id,
					},
					data: {
						status: YouTubeDataTaskKeywordStatus.SUCCESS,
					},
				});
			const dbSearches =
				await this.prismaService.youTubeDataApiSearch.createMany({
					data: searches.map((s) => {
						return {
							keyword: keyword.keyword,
							videoId: s.videoId,
							publishedAt: s.publishedAt,
							channelId: s.channelId,
							youTubeDataTaskId: this.meta.taskId as number,
						};
					}),
				});
		}
		this.meta.taskId = null;
		this.meta.status = "idle";
		this.meta.shouldStop = false;
	}

	async getMeta() {
		return this.meta;
	}

	async getCompositeData(taskId: number) {
		const task = await this.prismaService.youTubeDataTask.findUnique({
			where: {
				id: taskId,
			},
			include: {
				searches: true,
				channels: true,
				videos: true,
			},
		});
		if (!task) {
			throw new NotFoundException("Task not found.");
		}
		const searches = task.searches;
		const channels = task.channels;
		const videos = task.videos;
		/* per search as a datum */
		const compositeData = searches.map((s) => {
			const video = videos.find((v) => v.videoId === s.videoId);
			const channel = channels.find((c) => c.channelId === s.channelId);
			return {
				keyword: s.keyword,
				publishedAt: s.publishedAt,
				videoId: s.videoId,
				title: video?.title,
				description: video?.description,
				durationAsSeconds: video?.durationAsSeconds,
				viewCount: video?.viewCount.toString(),
				likeCount: video?.likeCount.toString(),
				favoriteCount: video?.favoriteCount.toString(),
				commentCount: video?.commentCount.toString(),
				channelId: s.channelId,
				channelTitle: channel?.channelTitle,
				channelViewCount: channel?.viewCount.toString(),
				channelVideoCount: channel?.videoCount.toString(),
				subscriberCount: channel?.subscriberCount.toString(),
			};
		});
		return compositeData;
	}

	async testYoutubeApi() {
		const url =
			// "https://jsonplaceholder.typicode.com/posts/1",
			"https://youtube.googleapis.com/youtube/v3/channels?key=AIzaSyCzyhpF6oh6eGs9tWc-7v2eqmRsrlXCfW0&id=UCxQbYGpbdrh-b2ND-AfIybg&part=id,statistics";
		const res = await axios.get(url);
		console.log(res.data);
		return res.data;
	}

	async abort() {
		this.meta.shouldStop = true;
		return this.meta;
	}
}
