import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@UseGuards(JwtAuthGuard)
	@Get()
	findAll(): Promise<User[]> {
		return this.usersService.find();
	}

	@Get('/:id')
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@Patch('/:id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(+id, updateUserDto);
	}

	@Delete('/:id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
