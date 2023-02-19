import { Body, ClassSerializerInterceptor, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { User } from "src/users/entities/user.entity";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RequiredPermissions } from "src/permissions/decorators/required-permissions.decorator";
import { Permissions } from "src/permissions/permissions.enum";
import { PermissionsGuard } from "src/permissions/guards/permissions.guard";
import { GoogleOAuth20AuthGuard } from "./guards/google-oauth20.guard";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Get("/hasAdmin")
	hasAdmin(): Promise<{ hasAdmin: boolean; }> {
		return this.authService.hasAdmin();
	}

	@Post("/seed")
	seed(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.authService.seed(createUserDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(PermissionsGuard)
	@UseGuards(JwtAuthGuard)
	@RequiredPermissions(Permissions.CREATE_USER)
	@Post("/signup")
	signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.authService.signUp(createUserDto);
	}

	@Post("/signin")
	signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string; }> {
		return this.authService.signIn(authCredentialsDto);
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
