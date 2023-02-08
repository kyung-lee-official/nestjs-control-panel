import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChituboxManualFeedbackDto } from './dto/create-chitubox-manual-feedback.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { Between, Repository } from "typeorm";
import { FindChituboxManualFeedbackDto } from "./dto/find-chitubox-manual-feedback.dto";
import * as dayjs from "dayjs";

@Injectable()
export class ChituboxManualFeedbacksService {
	constructor(
		@InjectRepository(ChituboxManualFeedback)
		private feedbacksRepository: Repository<ChituboxManualFeedback>,
	) { }

	async create(createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto, ip: string): Promise<ChituboxManualFeedback> {
		const { url, payload } = createChituboxManualFeedbackDto;
		const res = await fetch(`https://api.country.is/9.9.9.9`, { method: "GET" });
		// const res = await fetch(`https://api.country.is/${ip}`, { method: "GET" });
		try {
			const country = await res.json();
			const feedback = this.feedbacksRepository.create({ url, payload, ip, country: country.country });
			await this.feedbacksRepository.save(feedback);
			return feedback;
		} catch (error) {
			throw error;
		}
	}

	async find(findChituboxManualFeedbackDto: FindChituboxManualFeedbackDto): Promise<ChituboxManualFeedback[]> {
		const { startDate, endDate } = findChituboxManualFeedbackDto;
		console.log(dayjs(startDate).toDate());
		console.log(dayjs(endDate).toDate());

		if (startDate && endDate) {
			if (dayjs(endDate).isBefore(dayjs(startDate))) {
				throw new BadRequestException("endDate cannot be earlier than startDate");
			}
			const feedbacks = await this.feedbacksRepository.find({
				where: {
					createdDate: Between(
						dayjs(startDate).toDate(),
						dayjs(endDate).add(1, "day").toDate()
					)
				}
			});
			console.log(feedbacks);

			return feedbacks;
		} else if (startDate) {
			const feedbacks = await this.feedbacksRepository.find();
			return feedbacks;
		} else if (endDate) {
			const feedbacks = await this.feedbacksRepository.find();
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
