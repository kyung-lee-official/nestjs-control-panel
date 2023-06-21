import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { CreateChituboxManualFeedbackDto } from "./dto/create-chitubox-manual-feedback.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import * as dayjs from "dayjs";
import axios from "axios";
import { Iso8601DateRangeDto } from "./dto/iso8601-date-range.dto";

@Injectable()
export class ChituboxManualFeedbacksService {
	constructor(
		@InjectRepository(ChituboxManualFeedback)
		private feedbacksRepository: Repository<ChituboxManualFeedback>
	) {}

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
		const feedback = this.feedbacksRepository.create({
			pageId,
			url,
			payload,
			ip,
			country: country || "Unknown",
		});
		await this.feedbacksRepository.save(feedback);
		return null;
	}

	/**
	 * Since the server timezone is always UTC (use `timedatectl` command to check),
	 * the front end need to convert dates to UTC before sending the request.
	 */
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
			const feedbacks = await this.feedbacksRepository.find({
				where: {
					createdDate: Between(
						dayjs(startDate).toDate(),
						dayjs(endDate).toDate()
					),
				},
			});
			return feedbacks;
		} else if (startDate) {
			const feedbacks = await this.feedbacksRepository.find({
				where: {
					createdDate: MoreThanOrEqual(dayjs(startDate).toDate()),
				},
			});
			return feedbacks;
		} else if (endDate) {
			const feedbacks = await this.feedbacksRepository.find({
				where: {
					createdDate: LessThanOrEqual(dayjs(endDate).toDate()),
				},
			});
			return feedbacks;
		} else {
			const feedbacks = await this.feedbacksRepository.find();
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
