import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/signup")
	signUp(@Body() createUserDto: CreateUserDto) {
		return this.authService.signUp(createUserDto);
	}

	@Post("/signin")
	signIn(@Body() createUserDto: CreateUserDto) {
	}
}
