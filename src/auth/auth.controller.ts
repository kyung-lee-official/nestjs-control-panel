import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";

@Controller('auth')
export class AuthController {
	constructor(private usersService: UsersService) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/signup")
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}
}
