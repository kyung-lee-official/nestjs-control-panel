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
import { VerifyNewEmailDto } from "./dto/verify-new-email.dto";
import {
	forgetPasswordApiBodyOptions,
	forgetPasswordApiOperationOptions,
	forgetPasswordNotFoundApiResponseOptions,
} from "./swagger/forget-password.swagger";
import {
	ForgetPasswordDto,
	forgetPasswordSchema,
} from "./dto/forget-password.dto";
import { ChangeEmailDto, changeEmailSchema } from "./dto/change-email.dto";
import {
	verifyNewEmailApiBodyOptions,
	verifyNewEmailApiOperationOptions,
	verifyNewEmailOkResponseOptions,
} from "./swagger/verify-new-email.swagger";
import {
	changeEmailApiBodyOptions,
	changeEmailApiOkResponseOptions,
	changeEmailApiOperationOptions,
} from "./swagger/change-email.swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";

@ApiTags("Email")
@Controller("email-smtp")
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
	@ApiOperation(changeEmailApiOperationOptions)
	@ApiBody(changeEmailApiBodyOptions)
	@ApiOkResponse(changeEmailApiOkResponseOptions)
	@UseGuards(JwtGuard)
	@Patch("/change-email")
	changeEmail(
		@Req() req: any,
		@Body(new ZodValidationPipe(changeEmailSchema))
		changeEmailDto: ChangeEmailDto
	) {
		const { email } = req.jwtPayload;
		return this.emailService.changeEmail(email, changeEmailDto);
	}

	@ApiOperation(verifyNewEmailApiOperationOptions)
	@ApiBody(verifyNewEmailApiBodyOptions)
	@ApiOkResponse(verifyNewEmailOkResponseOptions)
	@Patch("/verify-email")
	verifyEmail(
		@Body() verifyEmailDto: VerifyNewEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.emailService.verifyEmail(verifyEmailDto);
	}

	@ApiOperation(forgetPasswordApiOperationOptions)
	@ApiBody(forgetPasswordApiBodyOptions)
	@ApiNotFoundResponse(forgetPasswordNotFoundApiResponseOptions)
	@Post("/forget-password")
	forgetPassword(
		@Body(new ZodValidationPipe(forgetPasswordSchema))
		forgetPasswordDto: ForgetPasswordDto
	): Promise<void> {
		return this.emailService.forgetPassword(forgetPasswordDto);
	}
}
