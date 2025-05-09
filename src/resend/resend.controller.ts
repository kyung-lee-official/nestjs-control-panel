import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ResendService } from "./resend.service";
import {
	ApiBearerAuth,
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { ChangeEmailDto, changeEmailSchema } from "./dto/change-email.dto";
import {
	changeEmailApiBodyOptions,
	changeEmailApiOkResponseOptions,
	changeEmailApiOperationOptions,
} from "./swagger/change-email.swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";
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
import {
	ForgetPasswordDto,
	forgetPasswordSchema,
} from "./dto/forget-password.dto";

@ApiTags("Email via Resend")
@Controller("email")
export class ResendController {
	constructor(private readonly resendService: ResendService) {}

	@ApiBearerAuth()
	@ApiOperation(changeEmailApiOperationOptions)
	@ApiBody(changeEmailApiBodyOptions)
	@ApiOkResponse(changeEmailApiOkResponseOptions)
	@UseGuards(JwtGuard)
	@Patch("change-email")
	changeEmail(
		@Req() req: any,
		@Body(new ZodValidationPipe(changeEmailSchema))
		changeEmailDto: ChangeEmailDto
	) {
		const { email } = req.jwtPayload;
		return this.resendService.changeEmail(email, changeEmailDto);
	}

	@ApiOperation(verifyNewEmailApiOperationOptions)
	@ApiBody(verifyNewEmailApiBodyOptions)
	@ApiOkResponse(verifyNewEmailOkResponseOptions)
	@Patch("verify-email")
	verifyEmail(
		@Body() verifyEmailDto: VerifyNewEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.resendService.verifyEmail(verifyEmailDto);
	}

	@ApiOperation(forgetPasswordApiOperationOptions)
	@ApiBody(forgetPasswordApiBodyOptions)
	@ApiNotFoundResponse(forgetPasswordNotFoundApiResponseOptions)
	@Post("forget-password")
	forgetPassword(
		@Body(new ZodValidationPipe(forgetPasswordSchema))
		forgetPasswordDto: ForgetPasswordDto
	): Promise<void> {
		return this.resendService.forgetPassword(forgetPasswordDto);
	}
}
