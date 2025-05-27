import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { FacebookGroupOverwriteSourceDto } from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { REQUEST } from "@nestjs/core";
import { UtilsService } from "src/utils/utils.service";
import { CerbosService } from "src/cerbos/cerbos.service";
import { CheckResourceRequest, Resource } from "@cerbos/core";

@Injectable()
export class FacebookGroupService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly utilsService: UtilsService,
		private readonly prismaService: PrismaService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions() {
		const { requester } = this.request;
		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*"];

		const resource: Resource = {
			kind: "internal:applications:retail:sns-crawler",
			id: "*",
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			actions: actions,
			resource: resource,
		};

		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);
		return decision;
	}

	async overwriteSource(
		facebookGroupOverwriteSourceDto: FacebookGroupOverwriteSourceDto
	) {
		await this.prismaService.facebookGroupSource.deleteMany();
		/* remove trailing slash */
		const nontrailingData = facebookGroupOverwriteSourceDto.map((s) => {
			return {
				excelRow: s.excelRow,
				groupAddress: s.groupAddress.endsWith("/")
					? s.groupAddress.slice(0, -1)
					: s.groupAddress,
				groupName: s.groupName,
			};
		});
		const uniquifiedData = nontrailingData.filter((s, i, a) => {
			return a.findIndex((d) => d.groupAddress === s.groupAddress) === i;
		});
		return await this.prismaService.facebookGroupSource.createMany({
			data: uniquifiedData,
		});
	}

	async updateSource(
		facebookGroupUpdateSourceDto: FacebookGroupUpdateSourceDto
	) {
		return await this.prismaService.facebookGroupSource.update({
			where: {
				groupAddress: facebookGroupUpdateSourceDto.groupAddress,
			},
			data: facebookGroupUpdateSourceDto,
		});
	}

	async getSource() {
		return await this.prismaService.facebookGroupSource.findMany();
	}

	async createTask() {
		const sourceData =
			await this.prismaService.facebookGroupSource.findMany();
		if (sourceData.length === 0) {
			throw new NotFoundException("No available source");
		}
		const task = await this.prismaService.facebookGroupCrawlTask.create({
			data: {
				records: {
					createMany: {
						data: sourceData.map((s) => {
							return {
								excelRow: s.excelRow,
								groupAddress: s.groupAddress,
								groupName: s.groupName,
								status: "PENDING",
								memberCount: 0,
								monthlyPostCount: 0,
							};
						}),
					},
				},
				sourceLength: sourceData.length,
			},
		});
		const launchRes = await axios.post(
			"facebook-crawler/launch",
			{ taskId: task.id },
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		if (!launchRes) {
			throw new InternalServerErrorException("Launching browser failed");
		}
		return launchRes.data;
	}

	async crawl(taskId: number) {
		const sourceData =
			await this.prismaService.facebookGroupSource.findMany();
		if (!sourceData) {
			throw new InternalServerErrorException("Invalid source");
		}
		if (sourceData.length === 0) {
			throw new NotFoundException("No available source");
		}
		const task = await this.prismaService.facebookGroupCrawlTask.findUnique(
			{
				where: {
					id: taskId,
				},
				include: {
					records: true,
				},
			}
		);
		if (!task) {
			throw new NotFoundException("Task not found");
		}
		for (const r of task.records) {
			let crawlRes;
			try {
				crawlRes = await axios.post(
					"facebook-crawler/crawl",
					{
						taskId: taskId,
						sourceData: {
							groupAddress: r.groupAddress,
							groupName: r.groupName,
						},
					},
					{
						baseURL: process.env.SNS_CRAWLER_HOST,
					}
				);
			} catch (error: any) {
				console.error(error.response.data);
				throw error;
			}
			try {
				if (!crawlRes.data) {
					await this.abortTask();
					return {
						taskId: task.id,
						/* TODO: add more props */
					};
				}
				if (crawlRes.data.taskId === null) {
					return crawlRes.data;
				}
				await this.prismaService.facebookGroupRecord.update({
					where: {
						id: r.id,
					},
					data: {
						status: crawlRes.data.crawledDatum.status,
						memberCount:
							crawlRes.data.crawledDatum.memberCount ?? 0,
						monthlyPostCount:
							crawlRes.data.crawledDatum.monthlyPostCount ?? 0,
					},
				});
			} catch (error) {
				console.error(error);
				continue;
			}
		}
		/* stop the crawler when all sources are crawled */
		await this.abortTask();
	}

	async recrawlFailedRecords(taskId: number) {
		const task = await this.prismaService.facebookGroupCrawlTask.findUnique(
			{
				where: {
					id: taskId,
				},
				include: {
					records: {
						where: {
							OR: [
								{
									status: "FAILED",
								},
								{
									status: "PENDING",
								},
							],
						},
					},
				},
			}
		);
		if (!task) {
			throw new NotFoundException("Task not found");
		}
		if (task.records.length === 0) {
			throw new BadRequestException("No failed records");
		}
		const launchRes = await axios.post(
			"facebook-crawler/launch",
			{ taskId: task.id },
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		if (!launchRes) {
			throw new InternalServerErrorException("Launching browser failed");
		}
		const failedRecords = task.records;
		for (const r of failedRecords) {
			let crawlRes;
			try {
				crawlRes = await axios.post(
					"facebook-crawler/crawl",
					{
						taskId: taskId,
						sourceData: {
							groupAddress: r.groupAddress,
							groupName: r.groupName,
						},
					},
					{
						baseURL: process.env.SNS_CRAWLER_HOST,
					}
				);
			} catch (error: any) {
				console.error(error.response.data);
				throw error;
			}
			try {
				if (!crawlRes.data) {
					await this.abortTask();
					return {
						taskId: task.id,
						/* TODO: add more props */
					};
				}
				if (crawlRes.data.taskId === null) {
					return crawlRes.data;
				}
				await this.prismaService.facebookGroupRecord.update({
					where: {
						id: r.id,
					},
					data: {
						status: crawlRes.data.crawledDatum.status,
						memberCount:
							crawlRes.data.crawledDatum.memberCount ?? 0,
						monthlyPostCount:
							crawlRes.data.crawledDatum.monthlyPostCount ?? 0,
					},
				});
			} catch (error) {
				console.error(error);
				continue;
			}
		}
		/* stop the crawler when all sources are crawled */
		await this.abortTask();
	}

	async getTasks() {
		return await this.prismaService.facebookGroupCrawlTask.findMany({
			include: {
				records: true,
			},
		});
	}

	async getTaskById(taskId: number) {
		const task = await this.prismaService.facebookGroupCrawlTask.findUnique(
			{
				where: {
					id: taskId,
				},
				include: {
					records: true,
				},
			}
		);
		return task;
	}

	async abortTask() {
		const crawlerRes = await axios.post(
			"facebook-crawler/abort",
			{},
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		return crawlerRes.data;
	}

	async getStatus() {
		try {
			const status = await axios.get(`facebook-crawler/get-status`, {
				baseURL: process.env.SNS_CRAWLER_HOST,
			});
			return status.data;
		} catch (error: any) {
			if (axios.isAxiosError(error)) {
				if (error.code === "ECONNABORTED") {
					/*  Timeout error */
					console.error("Request timed out:", error.message);
					/*  Handle timeout error appropriately (e.g., retry, show user message) */
				} else if (error.response) {
					/*  Server responded with an error status code */
					console.error(
						"Server error:",
						error.response.status,
						error.response.data
					);
					if (error.response.status === 404) {
						/*  Handle 404 Not Found */
						console.error("Resource not found");
						/* handle 404 error, like redirecting to a not found page. */
					} else if (error.response.status >= 500) {
						/*  Handle 5xx server errors */
						console.error("Server error occured.");
						/* Handle server errors, for example, show a retry button. */
					}
					/* You can also access the error.response.data to get more specific error messages from the backend. */
					console.error(error.response.data);
				} else if (error.request) {
					/* Request was made, but no response was received */
					console.error(
						"No response received, check if your crawler service is running."
					);
				} else {
					/* Error setting up the request */
					console.error("Error setting up request:", error.message);
				}
			} else {
				console.error("An unexpected error occurred:", error);
			}
			throw error; /* Rethrow the error to be handled by the caller. */
		}
	}

	async remove(taskId: number) {
		await this.prismaService.facebookGroupRecord.deleteMany({
			where: {
				facebookGroupCrawlTaskId: taskId,
			},
		});
		return await this.prismaService.facebookGroupCrawlTask.delete({
			where: {
				id: taskId,
			},
		});
	}

	// async update(id: number, updateFacebookGroupDto: OverFacebookGroupDto) {
	// 	return await `This action updates a #${id} facebookGroup`;
	// }
}
