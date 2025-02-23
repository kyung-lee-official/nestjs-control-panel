import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { FacebookGroupOverwriteSourceDto } from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { FacebookGroupCrawlRes } from "./response/facebook-group-crawl.res";

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

	async startTask() {
		const sourceData =
			await this.prismaService.facebookGroupSource.findMany();
		if (sourceData.length === 0) {
			throw new NotFoundException("No available source");
		}
		const task = await this.prismaService.facebookGroupCrawlTask.create({
			data: {
				records: {
					create: [],
				},
				sourceLength: sourceData.length,
			},
		});
		const startRes = await axios.post(
			"facebook-crawler/start",
			{ taskId: task.id },
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		if (!startRes) {
			throw new InternalServerErrorException("Start task failed");
		}
		this.crawl(task.id, sourceData);
		return { ...startRes.data, taskId: task.id };
	}

	async crawl(taskId, sourceData) {
		for (const s of sourceData) {
			try {
				const crawlRes = await axios.post<FacebookGroupCrawlRes>(
					"facebook-crawler/crawl",
					{
						taskId: taskId,
						sourceData: s,
					},
					{
						baseURL: process.env.SNS_CRAWLER_HOST,
					}
				);
				await this.prismaService.facebookGroupCrawlTask.update({
					where: {
						id: crawlRes.data.taskId,
					},
					data: {
						records: {
							create: {
								groupAddress: crawlRes.data.groupAddress,
								groupName: crawlRes.data.groupName,
								memberCount: crawlRes.data.memberCount,
								monthlyPostCount:
									crawlRes.data.monthlyPostCount,
							},
						},
					},
				});
			} catch (error) {
				console.error(error);
				continue;
			}
		}
		await axios.post(
			"facebook-crawler/abort",
			{},
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
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
		const status = await axios.get(
			`facebook-crawler/get-status/${taskId}`,
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		return { ...task, ...status.data };
	}

	async abortTask(taskId: number) {
		const crawlerRes = await axios.post(
			"facebook-crawler/abort",
			{
				taskId: taskId,
			},
			{
				baseURL: process.env.SNS_CRAWLER_HOST,
			}
		);
		return crawlerRes.data;
	}

	// async update(id: number, updateFacebookGroupDto: OverFacebookGroupDto) {
	// 	return await `This action updates a #${id} facebookGroup`;
	// }

	// async remove(id: number) {
	// 	return await `This action removes a #${id} facebookGroup`;
	// }
}
