import { BadRequestException, Injectable } from "@nestjs/common";
import { YoutubeDataOverwriteSourceDto } from "./dto/youtube-data-overwrite-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { YouTubeAddTokenDto } from "./dto/youtube-add-token.dto";
import { Prisma } from "@prisma/client";
import { YouTubeDataSearchDto } from "./dto/youtube-data-search.dto";
import { searchKeyword } from "./utils/searchKeyword";
import { YouTubeDataUpdateTokenStateDto } from "./dto/youtube-data-update-token-state.dto";
import { UpdateTaskKeywordSearchesByIdDto } from "./dto/update-task-keyword-by-id.dto";

@Injectable()
export class YoutubeDataCollectorService {
	private pendingAbort = false;
	private token = "";

	constructor(private readonly prismaService: PrismaService) {}

	async addToken(youtubeAddTokenDto: YouTubeAddTokenDto) {
		return await this.prismaService.youTubeDataToken.create({
			data: {
				token: youtubeAddTokenDto.token,
				isRecentlyUsed: false,
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

	async updateTokenState(
		youtubeDataUpdateTokenStateDto: YouTubeDataUpdateTokenStateDto
	) {
		const { recentlyUsedToken, oldToken } = youtubeDataUpdateTokenStateDto;
		/* update the recently used token */
		if (recentlyUsedToken) {
			/* clear the isRecentlyUsed flag of all tokens */
			await this.prismaService.youTubeDataToken.updateMany({
				where: {
					isRecentlyUsed: true,
				},
				data: {
					isRecentlyUsed: false,
				},
			});
			const newToken = await this.prismaService.youTubeDataToken.update({
				where: {
					token: recentlyUsedToken,
				},
				data: {
					isRecentlyUsed: true,
				},
			});
			return newToken;
		}
		if (oldToken) {
			/* clear the isRecentlyUsed flag of all tokens */
			await this.prismaService.youTubeDataToken.updateMany({
				where: {
					isRecentlyUsed: true,
				},
				data: {
					isRecentlyUsed: false,
				},
			});
			/* set the quotaRunOutAt of the old token */
			await this.prismaService.youTubeDataToken.update({
				where: {
					token: oldToken,
				},
				data: {
					quotaRunOutAt: new Date(),
				},
			});
			const oneMonthBack = new Date();
			oneMonthBack.setMonth(oneMonthBack.getMonth() - 1);
			let token = await this.prismaService.youTubeDataToken.findFirst({
				where: {
					OR: [
						{ quotaRunOutAt: Prisma.skip },
						{ quotaRunOutAt: { lte: oneMonthBack } },
					],
				},
			});
			if (!token) {
				throw new BadRequestException("No token available.");
			}
			token = await this.prismaService.youTubeDataToken.update({
				where: {
					token: token.token,
				},
				data: {
					isRecentlyUsed: true,
				},
			});
			return token;
		}
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
							pending: true,
							failed: false,
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

	async getTaskKeywordById(keywordId: number) {
		return await this.prismaService.youTubeDataTaskKeyword.findUnique({
			where: {
				id: keywordId,
			},
		});
	}

	// async updateTaskKeywordSearchesById(
	// 	updateTaskKeywordSearchesByIdDto: UpdateTaskKeywordSearchesByIdDto
	// ) {
	// 	const { id, searches } = updateTaskKeywordSearchesByIdDto;
	// 	return await this.prismaService.youTubeDataTaskKeyword.update({
	// 		where: {
	// 			id: id,
	// 		},
	// 		data: {
	// 			searches: {
	// 				create: searches.map((s) => {
	// 					return {
	// 						id: s.id,
	// 						publishedAt: s.publishedAt,
	// 						channelId: s.channelId,
	// 					};
	// 				}),
	// 			},
	// 		},
	// 	});
	// }

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

	// abort() {
	// 	this.pendingAbort = true;
	// }

	// remove(id: number) {
	// 	return `This action removes a #${id} youtubeDataCollector`;
	// }

	/**
	 * Retry a function.
	 * @param fn Function to retry.
	 * @param maxRetries Maximum times to retry.
	 */
	// async retry<T>(
	// 	fn: () => Promise<T>,
	// 	maxRetries?: number
	// ): Promise<T | undefined> {
	// 	try {
	// 		const success = await fn();
	// 		return success;
	// 	} catch (error: any) {
	// 		await this.handleError(error);
	// 		if (maxRetries == null) {
	// 			return await this.retry(fn);
	// 		} else {
	// 			if (maxRetries <= 0) {
	// 				console.log("Maximum try times reached.");
	// 				console.error(error);
	// 				throw error;
	// 			} else {
	// 				return await this.retry(fn, maxRetries - 1);
	// 			}
	// 		}
	// 	}
	// }

	/**
	 * Handle errors
	 * @param error error caught
	 */
	// async handleError(error: any) {
	// 	console.log("Error caught: ");
	// 	/* Handle errors */
	// 	if (error.response) {
	// 		/* The request was made and the server responded with a status code
	// 	that falls out of the range of 2xx */
	// 		if (error.response.data?.error?.code) {
	// 			switch (error.response.data.error.code) {
	// 				case 403:
	// 					console.log(error.response.data.error.errors);
	// 					if (
	// 						error.response.data.error.errors[0].reason ===
	// 						"quotaExceeded"
	// 					) {
	// 						console.log(
	// 							"The quota of current key has exceeded."
	// 						);
	// 						await this.updateToken();
	// 					} else {
	// 						console.log(error);
	// 					}
	// 					break;
	// 				case 400:
	// 					console.log(error.response.data.error.errors);
	// 					if (
	// 						error.response.data.error.errors[0].reason ===
	// 						"badRequest"
	// 					) {
	// 						console.log("The current key is invalid.");
	// 						await this.updateToken();
	// 					} else {
	// 						console.log(error);
	// 					}
	// 					break;
	// 				default:
	// 					console.log(error);
	// 					break;
	// 			}
	// 		} else {
	// 			console.log(error.response);
	// 		}
	// 	} else if (error.request) {
	// 		/* The request was made but no response was received
	// 	`error.request` is an instance of XMLHttpRequest in the browser and an instance of
	// 	http.ClientRequest in node.js */
	// 		// console.log(error.request);
	// 		console.log(`Error code: '${error.code}'`);
	// 		console.log("Error", error.message);
	// 	} else {
	// 		/* Something happened in setting up the request that triggered an Error */
	// 		console.log("Error", error.message);
	// 	}
	// 	console.log("Retrying...");
	// }
}
