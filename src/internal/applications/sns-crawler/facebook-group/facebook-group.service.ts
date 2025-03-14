import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { FacebookGroupOverwriteSourceDto } from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";

@Injectable()
export class FacebookGroupService {
	constructor(private readonly prismaService: PrismaService) {}

	async overwriteSource(
		facebookGroupOverwriteSourceDto: FacebookGroupOverwriteSourceDto
	) {
		await this.prismaService.facebookGroupSource.deleteMany();
		/* remove trailing slash */
		const nontrailingData = facebookGroupOverwriteSourceDto.map((s) => {
			return {
				groupAddress: s.groupAddress.endsWith("/")
					? s.groupAddress.slice(0, -1)
					: s.groupAddress,
				groupName: s.groupName,
			};
		});
		return await this.prismaService.facebookGroupSource.createMany({
			data: nontrailingData,
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
						memberCount: crawlRes.data.crawledDatum.memberCount,
						monthlyPostCount:
							crawlRes.data.crawledDatum.monthlyPostCount,
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
						memberCount: crawlRes.data.crawledDatum.memberCount,
						monthlyPostCount:
							crawlRes.data.crawledDatum.monthlyPostCount,
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
			console.log("An error occured... ", error.response.data);
			throw error;
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
