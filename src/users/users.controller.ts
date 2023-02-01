import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, ParseArrayPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@UseInterceptors(ClassSerializerInterceptor)
	@Get()
	find(
		@Query("email") email?,
		@Query("nickname") nickname?,
		@Query("roleIds", new ParseArrayPipe({ optional: true })) roleIds?: string[],
	): Promise<User[]> {
		return this.usersService.find(email, nickname, roleIds);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/:id')
	findOne(@Param('id') id: string): Promise<User> {
		return this.usersService.findOne(id);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Patch('/:id')
	update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
		@Query("roleIds", new ParseArrayPipe({ optional: true })) roleIds?: string[],
	): Promise<User> {
		return this.usersService.update(id, updateUserDto, roleIds);
	}

	@Delete('/:id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
