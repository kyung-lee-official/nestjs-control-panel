import { Column, PrimaryGeneratedColumn } from "typeorm";
import { ChituboxManualFeedbackPayload } from "../chitubox-manual-feedback-payload.enum";
import { ChituboxManualUrl } from "../chitubox-manual-url.enum";

export class ChituboxManualFeedback {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	url: ChituboxManualUrl;

	@Column()
	payload: ChituboxManualFeedbackPayload;

	@Column()
	ip: string;

	@Column()
	country: string;
}
