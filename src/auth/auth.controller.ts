import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { User } from "../users/entities/user.entity";
import { GoogleOAuth20AuthGuard } from "./guards/google-oauth20.guard";
import { AllowPublicSignUpGuard } from "../server-settings/guards/allow-public-sign-up.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ForgetPasswordDto } from "./dto/forget-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { CredentialData } from "qcloud-cos-sts";
import { UpdateEmailRequestDto } from "./dto/update-email-request";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get("/isSeeded")
	isSeeded(): Promise<{ isSeeded: boolean }> {
		return this.authService.isSeeded();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/seed")
	seed(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.authService.seed(createUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(AllowPublicSignUpGuard)
	@Post("/signup")
	signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.authService.signUp(createUserDto);
	}

	@Post("/signin")
	signIn(
		@Body() authCredentialsDto: AuthCredentialsDto
	): Promise<{ accessToken: string }> {
		return this.authService.signIn(authCredentialsDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get("/isSignedIn")
	isSignedIn(): Promise<{ isSignedIn: boolean }> {
		return this.authService.isSignedIn();
	}

	@UseGuards(JwtAuthGuard)
	@Get("/refreshAccessToken")
	refreshAccessToken(@Req() req: any): Promise<{ accessToken: string }> {
		return this.authService.refreshAccessToken(req);
	}

	@Get("/google")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuth(@Req() req: any) {}

	@Get("/google/redirect")
	@UseGuards(GoogleOAuth20AuthGuard)
	async googleAuthRedirect(@Req() req: any, @Res() res: any) {
		const googleOauth2Info = await this.authService.googleSignIn(req);
		if (googleOauth2Info.isNewUser) {
			if (googleOauth2Info.isSeedUser) {
				return res.redirect(
					`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewUser=true&isSeedUser=true`
				);
			} else {
				return res.redirect(
					`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewUser=true&isSeedUser=false`
				);
			}
		} else {
			return res.redirect(
				`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewUser=false&isSeedUser=false`
			);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post("/sendVerificationEmail")
	sendVerificationEmail(@Req() req: any): Promise<void> {
		const user = req.user;
		const email = user.email;
		return this.authService.sendVerificationEmail(email);
	}

	/**
	 * For auth.http testing only, should be commented out in production
	 */
	// @Post("/testSendInitialPasswordEmail")
	// testSendInitialPasswordEmail(@Body() emailObj: any): Promise<void> {
	// 	return this.authService.sendInitialPasswordEmail(
	// 		emailObj.email,
	// 		"123456"
	// 	);
	// }

	@Post("/verifyEmail")
	verifyEmail(
		@Body() verifyEmailDto: VerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.authService.verifyEmail(verifyEmailDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch("/update-email-request")
	sendUpdateEmailVerificationRequest(
		@Req() req: any,
		@Body() updateEmailRequestDto: UpdateEmailRequestDto
	): Promise<{ isSent: boolean }> {
		const user = req.user;
		const email = user.email;
		return this.authService.sendUpdateEmailVerificationRequest(
			email,
			updateEmailRequestDto
		);
	}

	@Patch("/verifyNewEmail")
	veryfyNewEmail(
		@Body() verifyEmailDto: VerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.authService.verifyNewEmail(verifyEmailDto);
	}

	@Post("/forgetPassword")
	forgetPassword(
		@Body() forgetPasswordDto: ForgetPasswordDto
	): Promise<void> {
		return this.authService.forgetPassword(forgetPasswordDto);
	}

	@Post("/resetPassword")
	resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto
	): Promise<{ isReset: boolean }> {
		return this.authService.resetPassword(resetPasswordDto);
	}

	@Get("tencentCosTempCredential")
	async getTemporaryCredential(): Promise<CredentialData> {
		return this.authService.getTemporaryCredential();
	}
}
