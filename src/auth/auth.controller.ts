import { Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { User } from "src/users/entities/user.entity";
import { GoogleOAuth20AuthGuard } from "./guards/google-oauth20.guard";
import { AllowPublicSignUpGuard } from "src/server-settings/guards/allow-public-sign-up.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Get("/isSeeded")
	isSeeded(): Promise<{ isSeeded: boolean; }> {
		return this.authService.isSeeded();
		return new Promise((resolve, reject) => {
			resolve({ isSeeded: false });
		});
	}

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
	signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string; }> {
		return this.authService.signIn(authCredentialsDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get("/isSignedIn")
	isSignedIn(): Promise<{ isSignedIn: boolean; }> {
		return this.authService.isSignedIn();
		return new Promise((resolve, reject) => {
			resolve({ isSignedIn: true });
		});
	}

	@Get("/google")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuth(@Req() req) { }

	@Get("/google/redirect")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuthRedirect(@Req() req) {
		return this.authService.googleSignIn(req);
	}
}
