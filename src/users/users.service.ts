import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from "@nestjs/typeorm/dist/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) { }

	async create(createUserDto: CreateUserDto): Promise<User> {
		const { email, password, nickname, role } = createUserDto;
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			role
		});
		await this.usersRepository.save(user);
		return user;
	}

	async find(): Promise<User[]> {
		const users = this.usersRepository.find();
		return users;
	}

	findOne(id: number) {
		return `This action returns a #${id} user`;
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}

	async remove(id: string): Promise<void> {
		const result = await this.usersRepository.delete({ id: id });
		if (result.affected === 0) {
			throw new NotFoundException(`Task with ID "${id}" not found.`);
		}
	}
}
