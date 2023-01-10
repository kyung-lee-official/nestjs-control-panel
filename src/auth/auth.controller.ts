import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/signup")
	signUp(@Body() createUserDto: CreateUserDto) {
		return this.authService.signUp(createUserDto);
	}

	@Post("/signin")
	signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string; }> {
		return this.authService.signIn(authCredentialsDto);
	}
}
