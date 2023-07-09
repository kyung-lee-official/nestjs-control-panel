import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Post,
	Req,
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

	@Get("/google")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuth(@Req() req: any) {}

	@Get("/google/redirect")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuthRedirect(@Req() req: any) {
		return this.authService.googleSignIn(req);
	}

	@Get("/testSendVerificationEmail")
	testSendVerificationEmail(): Promise<void> {
		return this.authService.testSendVerificationEmail();
	}

	@Post("/verifyEmail")
	verifyEmail(
		@Body() verifyEmailDto: VerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.authService.verifyEmail(verifyEmailDto);
	}
}
