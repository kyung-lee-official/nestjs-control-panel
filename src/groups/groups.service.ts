import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Group } from "./entities/group.entity";
import { Repository } from "typeorm";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(Group)
		private groupsRepository: Repository<Group>,
		private usersService: UsersService
	) { }

	async create(createGroupDto: CreateGroupDto): Promise<Group> {
		const { name } = createGroupDto;
		const dbGroup = await this.groupsRepository.findOne({ where: { name: name } });
		if (dbGroup) {
			throw new ConflictException("Group name already exists");
		}
		const group = await this.groupsRepository.create(createGroupDto);
		await this.groupsRepository.save(group);
		return group;
	}

	async findAll(): Promise<Group[]> {
		const groups = await this.groupsRepository.find({
			relations: {
				owner: true,
				users: true
			}
		});
		return groups;
	}

	async findOne(id: number): Promise<Group> {
		const group = await this.groupsRepository.findOne({
			where: {
				id: id
			},
			relations: {
				owner: true,
				users: {
					roles: true,
				}
			}
		});
		if (!group) {
			throw new NotFoundException("Group not found");
		}
		return group;
	}

	async update(id: number, updateGroupDto: Partial<UpdateGroupDto>): Promise<Group> {
		const { name, ownerId, userIds } = updateGroupDto;
		const group = await this.groupsRepository.findOne({
			where: {
				id: id
			},
			relations: ["users"]
		});
		if (!group) {
			throw new NotFoundException("Group not found");
		}
		if (name) {
			group.name = name;
		}
		if (ownerId && userIds) {
			if (!userIds.includes(ownerId)) {
				throw new BadRequestException("Group owner must be a member of the group");
			}
			const dbUsers = await this.usersService.findUsersByIds({ ids: userIds });
			const dbUserIds = dbUsers.map((user) => {
				return user.id;
			});
			if (dbUserIds.includes(ownerId)) {
				const owner = await this.usersService.findOne(ownerId);
				group.owner = owner;
				group.users = dbUsers;
			} else {
				throw new BadRequestException("Group owner must be a member of the group");
			}
		} else if (ownerId) {
			const owner = await this.usersService.findOne(ownerId);
			const groupUserIds = group.users.map((user) => {
				return user.id;
			});
			if (groupUserIds.includes(ownerId)) {
				group.owner = owner;
			} else {
				throw new BadRequestException("Group owner must be a member of the group");
			}
		} else if (userIds) {
			const dbUsers = await this.usersService.findUsersByIds({ ids: userIds });
			if (!group.owner) {
				group.users = dbUsers;
			} else {
				const dbUserIds = dbUsers.map((user) => {
					return user.id;
				});
				if (dbUserIds.includes(ownerId)) {
					group.users = dbUsers;
				} else {
					throw new BadRequestException("Group owner must be a member of the group");
				}
			}
		}
		await this.groupsRepository.save(group);
		return group;
	}

	async remove(id: number): Promise<any> {
		const group = await this.findOne(id);
		const result = await this.groupsRepository.delete({ id: group.id });
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the group");
		}
		return result;
	}
}
