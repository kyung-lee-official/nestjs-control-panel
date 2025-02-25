import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { CreateChituboxManualFeedbackDto } from "./dto/create-chitubox-manual-feedback.dto";
import dayjs from "dayjs";
import axios from "axios";
import { Iso8601DateRangeDto } from "./dto/iso8601-date-range.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { ChituboxManualFeedback } from "@prisma/client";

@Injectable()
export class ChituboxManualFeedbacksService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(
		createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto,
		headers: any
	): Promise<ChituboxManualFeedback> {
		const { pageId, url, payload } = createChituboxManualFeedbackDto;
		let ip = headers["x-real-ip"];
		if (!ip) {
			throw new BadRequestException("No IP address found");
		}
		let res: any;
		try {
			// res = await axios.get(`https://api.country.is/9.9.9.9`);
			if (ip.startsWith("::ffff:")) {
				ip = ip.slice(7);
			}
			res = await axios.get(`https://api.country.is/${ip}`);
		} catch (error) {
			throw new InternalServerErrorException("Country API error");
		}
		const { country } = res.data;
		if (!country) {
			throw new InternalServerErrorException("Country API error");
		}
		const feedback = this.prismaService.chituboxManualFeedback.create({
			data: {
				pageId,
				url,
				payload,
				ip,
				country: country || "Unknown",
			},
		});
		return feedback;
	}

	async find(
		dateRangeDto: Iso8601DateRangeDto
	): Promise<ChituboxManualFeedback[]> {
		const { startDate, endDate } = dateRangeDto;
		if (startDate && endDate) {
			if (dayjs(endDate).isBefore(dayjs(startDate))) {
				throw new BadRequestException(
					"endDate cannot be earlier than startDate"
				);
			}
			const feedbacks =
				await this.prismaService.chituboxManualFeedback.findMany({
					where: {
						createdAt: {
							gte: dayjs(startDate).toDate(),
							lte: dayjs(endDate).toDate(),
						},
					},
				});
			return feedbacks;
		} else if (startDate) {
			const feedbacks =
				await this.prismaService.chituboxManualFeedback.findMany({
					where: {
						createdAt: {
							gte: dayjs(startDate).toDate(),
						},
					},
				});
			return feedbacks;
		} else if (endDate) {
			const feedbacks =
				await this.prismaService.chituboxManualFeedback.findMany({
					where: {
						createdAt: {
							lte: dayjs(endDate).toDate(),
						},
					},
				});
			return feedbacks;
		} else {
			const feedbacks =
				await this.prismaService.chituboxManualFeedback.findMany();
			return feedbacks;
		}
	}

	findOne(id: number) {
		return `This action returns a #${id} chituboxManualFeedback`;
	}

	remove(id: number) {
		return `This action removes a #${id} chituboxManualFeedback`;
	}
}
