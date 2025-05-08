import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class ResendService {
	private resend: Resend;

	constructor() {
		this.resend = new Resend(process.env.RESEND_API_KEY);
	}

	async sendEmail(recipient: string, subject: string, html: string) {
		const { data, error } = await this.resend.emails.send({
			from: `${process.env.RESEND_SENDER_NAME} <${process.env.RESEND_SENDER_EMAIL}>`,
			to: recipient,
			subject: subject,
			html: html,
		});

		if (error) {
			throw new InternalServerErrorException(
				`Failed to send email: ${error.message}`
			);
		}

		return data;
	}
}
