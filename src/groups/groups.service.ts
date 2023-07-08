import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
	ServiceUnavailableException,
} from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Group } from "./entities/group.entity";
import { In, Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError } from "@casl/ability";

@Injectable({ scope: Scope.REQUEST })
export class GroupsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		@InjectRepository(Group)
		private groupsRepository: Repository<Group>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	async create(createGroupDto: CreateGroupDto): Promise<Group> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const { name } = createGroupDto;
		const dbGroup = await this.groupsRepository.findOne({
			where: { name: name },
		});
		if (dbGroup) {
			throw new ConflictException("Group name already exists");
		}
		const group = this.groupsRepository.create(createGroupDto);
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.CREATE, group);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		await this.groupsRepository.save(group);
		return group;
	}

	async findAll(): Promise<Group[]> {
		const groups = await this.groupsRepository.find({
			relations: {
				owner: true,
				users: true,
			},
		});
		return groups;
	}

	async findOne(id: number): Promise<Group> {
		const group = await this.groupsRepository.findOne({
			where: {
				id: id,
			},
			relations: {
				owner: true,
				users: true,
			},
		});
		if (!group) {
			throw new NotFoundException("Group not found");
		}
		return group;
	}

	async update(
		id: number,
		updateGroupDto: Partial<UpdateGroupDto>
	): Promise<Group> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const dbGroup = await this.groupsRepository.findOne({
			where: { id: id },
			relations: ["users"],
		});
		if (!dbGroup) {
			throw new NotFoundException("Group not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.UPDATE,
				dbGroup
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const { name, ownerId, userIds } = updateGroupDto;
		if (name) {
			dbGroup.name = name;
		}
		if (ownerId && userIds) {
			if (!userIds.includes(ownerId)) {
				throw new BadRequestException(
					"Group owner must be a member of the group"
				);
			}
			const dbUsers = await this.usersRepository.find({
				where: { id: In(userIds) },
			});
			const dbUserIds = dbUsers.map((user) => {
				return user.id;
			});
			if (dbUserIds.includes(ownerId)) {
				const owner = await this.usersRepository.findOne({
					where: { id: ownerId },
				});
				dbGroup.owner = owner;
				dbGroup.users = dbUsers;
			} else {
				throw new BadRequestException(
					"Group owner must be a member of the group"
				);
			}
		} else if (ownerId) {
			const owner = await this.usersRepository.findOne({
				where: { id: ownerId },
			});
			const groupUserIds = dbGroup.users.map((user) => {
				return user.id;
			});
			if (groupUserIds.includes(ownerId)) {
				dbGroup.owner = owner;
			} else {
				throw new BadRequestException(
					"Group owner must be a member of the group"
				);
			}
		} else if (userIds) {
			const dbUsers = await this.usersRepository.find({
				where: { id: In(userIds) },
			});
			if (!dbGroup.owner) {
				dbGroup.users = dbUsers;
			} else {
				const dbUserIds = dbUsers.map((user) => {
					return user.id;
				});
				if (dbUserIds.includes(ownerId)) {
					dbGroup.users = dbUsers;
				} else {
					throw new BadRequestException(
						"Group owner must be a member of the group"
					);
				}
			}
		}
		await this.groupsRepository.save(dbGroup);
		return dbGroup;
	}

	async remove(id: number): Promise<any> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const dbGroup = await this.groupsRepository.findOne({
			where: { id: id },
			relations: ["users"],
		});
		if (!dbGroup) {
			throw new NotFoundException("Group not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.DELETE,
				dbGroup
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		if (dbGroup.users.length > 0) {
			throw new BadRequestException(
				"Can not delete a group that has users"
			);
		}
		const result = await this.groupsRepository.delete({ id: dbGroup.id });
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the group");
		}
		return result;
	}
}
