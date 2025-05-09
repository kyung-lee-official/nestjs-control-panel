import {
	Controller,
	Post,
	Body,
	UsePipes,
	UseInterceptors,
	Get,
	Patch,
	Req,
	UseGuards,
	Res,
} from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { SignUpDto, signUpSchema } from "./dto/signup.dto";
import {
	ApiTags,
	ApiOperation,
	ApiBody,
	ApiOkResponse,
	ApiForbiddenResponse,
	ApiBearerAuth,
	ApiUnauthorizedResponse,
	ApiQuery,
} from "@nestjs/swagger";
import {
	signUpBodyOptions,
	signUpForbiddenResponseOptions,
	signUpOkResponseOptions,
	signUpOperationOptions,
} from "./swagger/signup.swagger";
import {
	signInBodyOptions,
	signInOperationOptions,
} from "./swagger/signin.swagger";
import { SignInDto, signInSchema } from "./dto/signin.dto";
import { ExcludePasswordInterceptor } from "src/interceptors/exclude-password.interceptor";
import { JwtGuard } from "./guards/jwt.guard";
import {
	refreshJwtOkResponseOptions,
	refreshJwtOperationOptions,
} from "./swagger/refresh-jwt.swagger";
import {
	isSignedInOkResponseOptions,
	isSignedInOperationOptions,
	isSignedInUnauthorizedOptions,
} from "./swagger/is-signed-in.swagger";
import {
	googleAuthRedirectAuthuserOptions,
	googleAuthRedirectCodeOptions,
	googleAuthredirectForbiddenOptions,
	googleAuthRedirectOkResponseOptions,
	googleAuthRedirectOperationOptions,
	googleAuthRedirectPromptOptions,
	googleAuthRedirectScopeOptions,
} from "./swagger/google-auth-redirect.swagger";
import {
	resetPasswordApiBodyOptions,
	resetPasswordApiOperationOptions,
} from "./swagger/reset-password.swagger";
import {
	ResetPasswordDto,
	resetPasswordSchema,
} from "./dto/reset-password.dto";
import {
	getTencentCosTempCredentialApiOkResponseOptions,
	getTencentCosTempCredentialApiOperationOptions,
} from "./swagger/tencent-cos-temp-credential.swagger";
import { CredentialData } from "qcloud-cos-sts";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import {
	UpdateMyPasswordDto,
	updateMyPasswordSchema,
} from "./dto/update-my-password.dto";
import {
	updateMyPasswordBodyOptions,
	updateMyPasswordOperationOptions,
} from "./swagger/update-my-password.swagger";
import { UpdateMyPasswordGuard } from "./guards/update-my-password.guard";
import { SignUpGuard } from "./guards/sign-up.guard";

@ApiTags("Authentication")
@Controller("authentication")
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService
	) {}

	@ApiOperation(signUpOperationOptions)
	@ApiBody(signUpBodyOptions)
	@ApiOkResponse(signUpOkResponseOptions)
	@ApiForbiddenResponse(signUpForbiddenResponseOptions)
	@UsePipes(new ZodValidationPipe(signUpSchema))
	@UseGuards(SignUpGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Post("sign-up")
	async signUp(@Body() signUpDto: SignUpDto) {
		return await this.authenticationService.signUp(signUpDto);
	}

	@ApiOperation(signInOperationOptions)
	@ApiBody(signInBodyOptions)
	@UsePipes(new ZodValidationPipe(signInSchema))
	@Post("sign-in")
	async signIn(@Body() signInDto: SignInDto) {
		return await this.authenticationService.signIn(signInDto);
	}

	@ApiBearerAuth()
	@ApiOperation(isSignedInOperationOptions)
	@ApiOkResponse(isSignedInOkResponseOptions)
	@ApiUnauthorizedResponse(isSignedInUnauthorizedOptions)
	@UseGuards(JwtGuard)
	@Get("is-signed-in")
	async isSignedIn() {
		return await this.authenticationService.isSignedIn();
	}

	@ApiBearerAuth()
	@ApiOperation(refreshJwtOperationOptions)
	@ApiOkResponse(refreshJwtOkResponseOptions)
	@UseGuards(JwtGuard)
	@Get("refresh-jwt")
	async refreshJwt(@Req() req: any) {
		return await this.authenticationService.refreshJwt(req);
	}

	@ApiOperation(updateMyPasswordOperationOptions)
	@ApiBody(updateMyPasswordBodyOptions)
	@UseGuards(UpdateMyPasswordGuard)
	@UseInterceptors(ExcludePasswordInterceptor)
	@Patch("/my-password")
	@UseGuards(JwtGuard)
	updateMyPassword(
		@Body(new ZodValidationPipe(updateMyPasswordSchema))
		updateMyPasswordDto: UpdateMyPasswordDto
	) {
		return this.authenticationService.updateMyPassword(updateMyPasswordDto);
	}

	@ApiOperation(resetPasswordApiOperationOptions)
	@ApiBody(resetPasswordApiBodyOptions)
	@Post("/reset-password")
	resetPassword(
		@Body(new ZodValidationPipe(resetPasswordSchema))
		resetPasswordDto: ResetPasswordDto
	): Promise<{ isReset: boolean }> {
		return this.authenticationService.resetPassword(resetPasswordDto);
	}

	@ApiOperation(googleAuthRedirectOperationOptions)
	@ApiQuery(googleAuthRedirectPromptOptions)
	@ApiQuery(googleAuthRedirectAuthuserOptions)
	@ApiQuery(googleAuthRedirectScopeOptions)
	@ApiQuery(googleAuthRedirectCodeOptions)
	@ApiOkResponse(googleAuthRedirectOkResponseOptions)
	@ApiForbiddenResponse(googleAuthredirectForbiddenOptions)
	@Get("/google/redirect")
	async googleAuthRedirect(@Req() req: any, @Res() res: any) {
		const googleOauth2Info =
			await this.authenticationService.googleSignIn(req);
		if (googleOauth2Info.isNewMember) {
			if (googleOauth2Info.isSeedMember) {
				return res.redirect(
					`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=true&isSeedMember=true`
				);
			} else {
				return res.redirect(
					`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=true&isSeedMember=false`
				);
			}
		} else {
			return res.redirect(
				`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=false&isSeedMember=false`
			);
		}
	}

	@ApiOperation(getTencentCosTempCredentialApiOperationOptions)
	@ApiOkResponse(getTencentCosTempCredentialApiOkResponseOptions)
	@Get("tencent-cos-temp-credential")
	async getTencentCosTempCredential(): Promise<CredentialData> {
		return this.authenticationService.getTencentCosTempCredential();
	}
}
