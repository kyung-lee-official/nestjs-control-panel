import { BadRequestException, Injectable } from "@nestjs/common";
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

type Flags = {
	token: {
		token: string;
		isRecentlyUsed: boolean;
		quotaRunOutAt: Date | null;
	} | null;
	taskId: number | null;
	status: "idle" | "running";
	pendingFlag: "shouldStart" | "shouldStop" | null;
	start: string;
	end: string;
	targetResultCount: number;
};

@Injectable()
export class YoutubeDataCollectorService {
	private meta: Flags = {
		token: null,
		taskId: null,
		status: "idle",
		pendingFlag: "shouldStop",
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

	async refreshToken() {
		/* clear the isRecentlyUsed flag of all tokens */
		await this.prismaService.youTubeDataToken.updateMany({
			where: {
				isRecentlyUsed: true,
			},
			data: {
				isRecentlyUsed: false,
			},
		});
		const newToken = await this.prismaService.youTubeDataToken.findFirst({
			where: {
				OR: [
					{ quotaRunOutAt: null },
					{
						quotaRunOutAt: {
							/* before 1 month ago */
							lte: dayjs().subtract(1, "month").toDate(),
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
		this.meta.token = newToken;
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

	async startProcess() {
		if (this.meta.status === "running") {
			return this.meta;
		} else {
			this.meta.status = "running";
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
			if (!this.meta.token) {
				throw new BadRequestException("Please provide a token");
			}
			let searches: SearchResultStruct[] = [];
			try {
				searches = await searchKeyword(
					this.meta.token.token,
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
							const dbToken =
								await this.prismaService.youTubeDataToken.update(
									{
										where: {
											token: this.meta.token.token,
										},
										data: {
											isRecentlyUsed: false,
											isExpired: true,
										},
									}
								);
							await this.refreshToken();
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
		this.meta.pendingFlag = null;
	}

	async startTaskById(youtubeDataSearchDto: YouTubeDataSearchDto) {
		const { taskId, start, end, targetResultCount } = youtubeDataSearchDto;
		await this.refreshToken();
		this.meta = {
			token: this.meta.token,
			taskId: taskId,
			status: "idle",
			pendingFlag: "shouldStart",
			start: start,
			end: end,
			targetResultCount: targetResultCount,
		};
		this.startProcess();
	}

	async getMeta() {
		return this.meta;
	}

	async testYoutubeApi() {
		const url =
			// "https://jsonplaceholder.typicode.com/posts/1",
			"https://youtube.googleapis.com/youtube/v3/channels?key=AIzaSyCzyhpF6oh6eGs9tWc-7v2eqmRsrlXCfW0&id=UCxQbYGpbdrh-b2ND-AfIybg&part=id,statistics";
		const res = await axios.get(url);
		console.log(res.data);
		return res.data;
	}

	// async search(youTubeSearchDto: YouTubeDataSearchDto) {
	// 	const { taskId, start, end, targetResultCount } = youTubeSearchDto;
	// 	const dbKeywords =
	// 		await this.prismaService.youTubeDataTaskKeyword.findMany({
	// 			where: {
	// 				taskId: taskId,
	// 			},
	// 		});
	// 	for (const k of dbKeywords) {
	// 		if (this.pendingAbort) {
	// 			this.pendingAbort = false;
	// 			return;
	// 		}
	// 		try {
	// 			const results = await searchKeyword(
	// 				this.token,
	// 				k.keyword,
	// 				start,
	// 				end,
	// 				targetResultCount
	// 			);
	// 			const youtubeDataTaskKeyword =
	// 				await this.prismaService.youTubeDataTaskKeyword.update({
	// 					where: {
	// 						id: k.id,
	// 					},
	// 					data: {
	// 						pending: false,
	// 						failed: false,
	// 						searches: {
	// 							create: results.map((r) => {
	// 								return {
	// 									keyword: k.keyword,
	// 									id: r.videoId,
	// 									publishedAt: r.publishedAt,
	// 									channelId: r.channelId,
	// 								};
	// 							}),
	// 						},
	// 					},
	// 				});
	// 		} catch (error: any) {
	// 			console.error(
	// 				`an error occurred when searching for ${k.keyword}`
	// 			);
	// 			console.error(error);
	// 			if (
	// 				error.response.data.error.errors[0].reason ===
	// 				"quotaExceeded"
	// 			) {
	// 				await this.updateToken(this.token);
	// 			}
	// 			await this.prismaService.youTubeDataTaskKeyword.update({
	// 				where: {
	// 					id: k.id,
	// 				},
	// 				data: {
	// 					failed: true,
	// 				},
	// 			});
	// 			continue;
	// 		}
	// 	}
	// 	return await this.prismaService.youTubeDataTaskKeyword.findUnique({
	// 		where: {
	// 			id: taskId,
	// 		},
	// 		include: {
	// 			searches: true,
	// 		},
	// 	});
	// }
}
