import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "./entities/role.entity";

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>
	) { }
	async create(createRoleDto: CreateRoleDto): Promise<Role> {
		const role = this.rolesRepository.create(createRoleDto);
		try {
			await this.rolesRepository.save(role);
			return role;
		} catch (error) {
			if (error.code === "23505") {
				throw new ConflictException("Role already exists");
			}
		}
	}

	async find(roleIds?: string[]): Promise<Role[]> {
		let ids: number[];
		if (roleIds) {
			ids = roleIds.map((id: string) => {
				const parseResult = parseInt(id);
				if (Number.isNaN(parseResult)) {
					throw new BadRequestException("The values of ids must be numeric");
				}
				return parseResult;
			});
		}

		let roles: Role[];
		if (ids) {
			roles = await this.rolesRepository.find({
				where: {
					id: In(ids)
				},
				relations: ["users"]
			});
			return roles;
		} else {
			roles = await this.rolesRepository.find({
				relations: ["users"]
			});
			return roles;
		}
	}

	async findOne(id: number): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: {
				id: id
			},
			relations: ["users"]
		});
		return role;
	}

	async update(id: number, updateRoleDto: Partial<UpdateRoleDto>) {
		const role = await this.findOne(id);
		if (!role) {
			throw new NotFoundException("Role not found");
		}
		Object.assign(role, updateRoleDto);

		try {
			const result = await this.rolesRepository.save(role);
			return result;
		} catch (error) {
			throw error;
		}
	}

	remove(id: number) {
		return `This action removes a #${id} role`;
	}
}
