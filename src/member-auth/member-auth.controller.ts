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
import { CreateMemberDto } from "../members/dto/create-member.dto";
import { MemberAuthService } from "./member-auth.service";
import { MemberAuthCredentialsDto } from "./dto/member-auth-credential.dto";
import { Member } from "../members/entities/member.entity";
import { GoogleOAuth20AuthGuard } from "./guards/google-oauth20.guard";
import { AllowPublicSignUpGuard } from "../member-server-settings/guards/allow-public-sign-up.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { MemberVerifyEmailDto } from "./dto/member-verify-email.dto";
import { MemberForgetPasswordDto } from "./dto/member-forget-password.dto";
import { MemberResetPasswordDto } from "./dto/member-reset-password.dto";
import { CredentialData } from "qcloud-cos-sts";
import { MemberUpdateEmailRequestDto } from "./dto/member-update-email-request";

@Controller("member-auth")
export class MemberAuthController {
	constructor(private memberAuthService: MemberAuthService) { }

	@Get("/isSeeded")
	isSeeded(): Promise<{ isSeeded: boolean; }> {
		return this.memberAuthService.isSeeded();
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/seed")
	seed(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.memberAuthService.seed(createMemberDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(AllowPublicSignUpGuard)
	@Post("/signup")
	signUp(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.memberAuthService.signUp(createMemberDto);
	}

	@Post("/signin")
	signIn(
		@Body() authCredentialsDto: MemberAuthCredentialsDto
	): Promise<{ accessToken: string; }> {
		return this.memberAuthService.signIn(authCredentialsDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get("isSignedIn")
	isSignedIn(): Promise<{ isSignedIn: boolean; }> {
		return this.memberAuthService.isSignedIn();
	}

	@UseGuards(JwtAuthGuard)
	@Get("/refreshAccessToken")
	refreshAccessToken(@Req() req: any): Promise<{ accessToken: string; }> {
		return this.memberAuthService.refreshAccessToken(req);
	}

	@Get("/google")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuth(@Req() req: any) { }

	@Get("/google/redirect")
	@UseGuards(GoogleOAuth20AuthGuard)
	async googleAuthRedirect(@Req() req: any, @Res() res: any) {
		const googleOauth2Info = await this.memberAuthService.googleSignIn(req);
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

	@UseGuards(JwtAuthGuard)
	@Post("/sendVerificationEmail")
	sendVerificationEmail(@Req() req: any): Promise<void> {
		const member = req.user;
		const email = member.email;
		return this.memberAuthService.sendVerificationEmail(email);
	}

	/**
	 * For member-auth.http testing only, should be commented out in production
	 */
	// @Post("/testSendInitialPasswordEmail")
	// testSendInitialPasswordEmail(@Body() emailObj: any): Promise<void> {
	// 	return this.memberAuthService.sendInitialPasswordEmail(
	// 		emailObj.email,
	// 		"123456"
	// 	);
	// }

	@Post("/verifyEmail")
	verifyEmail(
		@Body() verifyEmailDto: MemberVerifyEmailDto
	): Promise<{ isVerified: boolean; }> {
		return this.memberAuthService.verifyEmail(verifyEmailDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch("/update-email-request")
	sendUpdateEmailVerificationRequest(
		@Req() req: any,
		@Body() updateEmailRequestDto: MemberUpdateEmailRequestDto
	): Promise<{ isSent: boolean; }> {
		const member = req.user;
		const email = member.email;
		return this.memberAuthService.sendUpdateEmailVerificationRequest(
			email,
			updateEmailRequestDto
		);
	}

	@Patch("/verifyNewEmail")
	veryfyNewEmail(
		@Body() verifyEmailDto: MemberVerifyEmailDto
	): Promise<{ isVerified: boolean; }> {
		return this.memberAuthService.verifyNewEmail(verifyEmailDto);
	}

	@Post("/forgetPassword")
	forgetPassword(
		@Body() forgetPasswordDto: MemberForgetPasswordDto
	): Promise<void> {
		return this.memberAuthService.forgetPassword(forgetPasswordDto);
	}

	@Post("/resetPassword")
	resetPassword(
		@Body() resetPasswordDto: MemberResetPasswordDto
	): Promise<{ isReset: boolean; }> {
		return this.memberAuthService.resetPassword(resetPasswordDto);
	}

	@Get("tencentCosTempCredential")
	async getTemporaryCredential(): Promise<CredentialData> {
		return this.memberAuthService.getTemporaryCredential();
	}
}
