import { Injectable } from '@nestjs/common';
import { CreateChituboxManualFeedbackDto } from './dto/create-chitubox-manual-feedback.dto';

@Injectable()
export class ChituboxManualFeedbacksService {
	create(createChituboxManualFeedbackDto: CreateChituboxManualFeedbackDto, ip: string) {
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
