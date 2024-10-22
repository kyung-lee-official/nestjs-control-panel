import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { EmailService } from "./email.service";
import {
	ApiBearerAuth,
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { JwtGuard } from "../authentication/guards/jwt.guard";
import { sendVerificationEmailOperationOptions } from "./swagger/send-verification-email.swagger";
import {
	sendUpdateEmailVerificationRequestApiBodyOptions,
	sendUpdateEmailVerificationRequestApiOkResponseOptions,
	sendUpdateEmailVerificationRequestApiOperationOptions,
} from "./swagger/send-update-email-verification-request";
import { SendUpdateEmailVerificationRequestDto } from "./dto/send-update-email-verification-request.dto";
import {
	verifyNewEmailApiBodyOptions,
	verifyNewEmailApiOperationOptions,
	verifyNewEmailOkResponseOptions,
} from "./swagger/verify-new-email.swagger";
import { VerifyNewEmailDto } from "./dto/verify-new-email.dto";
import {
	forgetPasswordApiBodyOptions,
	forgetPasswordApiOperationOptions,
	forgetPasswordNotFoundApiResponseOptions,
} from "./swagger/forget-password.swagger";
import { ForgetPasswordDto } from "./dto/forget-password.dto";

@ApiTags("Email")
@Controller("email")
export class EmailController {
	constructor(private readonly emailService: EmailService) {}

	@ApiBearerAuth()
	@ApiOperation(sendVerificationEmailOperationOptions)
	@UseGuards(JwtGuard)
	@Post("/send-verification-email")
	async sendVerificationEmail(@Req() req: any) {
		const { email } = req.jwtPayload;
		return await this.emailService.sendVerificationEmail(email);
	}

	@ApiBearerAuth()
	@ApiOperation(sendUpdateEmailVerificationRequestApiOperationOptions)
	@ApiBody(sendUpdateEmailVerificationRequestApiBodyOptions)
	@ApiOkResponse(sendUpdateEmailVerificationRequestApiOkResponseOptions)
	@UseGuards(JwtGuard)
	@Patch("/send-update-email-verification-request")
	sendUpdateEmailVerificationRequest(
		@Req() req: any,
		@Body() updateEmailRequestDto: SendUpdateEmailVerificationRequestDto
	): Promise<{ isSent: boolean }> {
		const { email } = req.jwtPayload;
		return this.emailService.sendUpdateEmailVerificationRequest(
			email,
			updateEmailRequestDto
		);
	}

	@ApiOperation(verifyNewEmailApiOperationOptions)
	@ApiBody(verifyNewEmailApiBodyOptions)
	@ApiOkResponse(verifyNewEmailOkResponseOptions)
	@Patch("/verify-new-email")
	verifyNewEmail(
		@Body() verifyEmailDto: VerifyNewEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.emailService.verifyNewEmail(verifyEmailDto);
	}

	@ApiOperation(forgetPasswordApiOperationOptions)
	@ApiBody(forgetPasswordApiBodyOptions)
	@ApiNotFoundResponse(forgetPasswordNotFoundApiResponseOptions)
	@Post("/forget-password")
	forgetPassword(
		@Body() forgetPasswordDto: ForgetPasswordDto
	): Promise<void> {
		return this.emailService.forgetPassword(forgetPasswordDto);
	}
}
