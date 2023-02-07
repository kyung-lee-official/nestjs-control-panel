import { Injectable } from '@nestjs/common';
import { CreateChituboxManualFeedbackDto } from './dto/create-chitubox-manual-feedback.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "./entities/chitubox-manual-feedback-record.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChituboxManualFeedbacksService {
	constructor(
		@InjectRepository(ChituboxManualFeedback)
		private rolesRepository: Repository<ChituboxManualFeedback>,
	) { }

	create(createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto, ip: string) {
		const { url, payload } = createChituboxManualFeedbackDto;
		return 'This action adds a new chituboxManualFeedback';
	}

	findAll() {
		return `This action returns all chituboxManualFeedbacks`;
	}

	findOne(id: number) {
		return `This action returns a #${id} chituboxManualFeedback`;
	}

	remove(id: number) {
		return `This action removes a #${id} chituboxManualFeedback`;
	}
}
