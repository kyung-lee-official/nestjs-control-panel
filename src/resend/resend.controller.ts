import { Controller, Post } from "@nestjs/common";
import { ResendService } from "./resend.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("resend")
@Controller("resend")
export class ResendController {
	constructor(private readonly resendService: ResendService) {}

	@Post()
	sendEmail(recipient: string, subject: string, html: string) {
		return this.resendService.sendEmail(recipient, subject, html);
	}
}
