import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChituboxManualFeedbackPayload } from "../chitubox-manual-feedback-payload.enum";

@Entity()
export class ChituboxManualFeedback {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column()
	url: string;

	@Column()
	payload: ChituboxManualFeedbackPayload;

	@Column()
	ip: string;

	@Column()
	country: string;

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
