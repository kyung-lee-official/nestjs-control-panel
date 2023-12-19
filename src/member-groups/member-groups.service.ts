import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
	ServiceUnavailableException,
} from "@nestjs/common";
import { UpdateMemberGroupDto } from "./dto/update-member-group.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberGroup } from "./entities/member-group.entity";
import { In, Repository } from "typeorm";
import { Member } from "../members/entities/member.entity";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError } from "@casl/ability";

@Injectable({ scope: Scope.REQUEST })
export class MemberGroupsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		@InjectRepository(MemberGroup)
		private groupsRepository: Repository<MemberGroup>,
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
		private caslAbilityFactory: CaslAbilityFactory
	) { }

	async create(): Promise<MemberGroup> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const groupsRepository = this.groupsRepository;
		async function generateNewMemberGroupName(newMemberGroupNameIndex: number) {
			let newMemberGroupName = "New Group";
			if (newMemberGroupNameIndex === 0) {
				newMemberGroupName = "New Group";
			} else {
				newMemberGroupName = "New Group" + newMemberGroupNameIndex;
			}
			let newMemberGroup = await groupsRepository.findOne({
				where: {
					name: newMemberGroupName,
				},
			});
			if (newMemberGroup) {
				newMemberGroupNameIndex++;
				return await generateNewMemberGroupName(newMemberGroupNameIndex);
			} else {
				return newMemberGroupName;
			}
		}
		const newMemberGroupName = await generateNewMemberGroupName(0);
		const dbRequester = await this.membersRepository.findOne({
			where: {
				id: requester.id,
			},
		});
		const memberGroup = this.groupsRepository.create({
			name: newMemberGroupName,
			owner: dbRequester,
			members: [dbRequester],
		});

		try {
			/**
			 * Here the exact subject instance is required instead of the Subject type
			 * because the subject name need to match the conditions in the AbilityFactory
			 */
			ForbiddenError.from(ability).throwUnlessCan(Actions.CREATE, memberGroup);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		await this.groupsRepository.save(memberGroup);
		return memberGroup;
	}

	async findAll(): Promise<MemberGroup[]> {
		const groups = await this.groupsRepository.find({
			relations: {
				owner: true,
				members: true,
			},
		});
		return groups;
	}

	async findOne(id: number): Promise<MemberGroup> {
		const group = await this.groupsRepository.findOne({
			where: {
				id: id,
			},
			relations: {
				owner: true,
				members: true,
			},
		});
		if (!group) {
			throw new NotFoundException("Member Group not found");
		}
		return group;
	}

	async update(
		id: number,
		updateMemberGroupDto: Partial<UpdateMemberGroupDto>
	): Promise<MemberGroup> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const dbMemberGroup = await this.groupsRepository.findOne({
			where: { id: id },
			relations: ["members"],
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("Member Group not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.UPDATE,
				dbMemberGroup
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const { name, ownerId, memberIds } = updateMemberGroupDto;
		if (name) {
			dbMemberGroup.name = name;
		}
		if (ownerId && memberIds) {
			if (!memberIds.includes(ownerId)) {
				throw new BadRequestException(
					"Member group owner must be a member of the group"
				);
			}
			const dbMembers = await this.membersRepository.find({
				where: { id: In(memberIds) },
			});
			const dbMemberIds = dbMembers.map((member) => {
				return member.id;
			});
			if (dbMemberIds.includes(ownerId)) {
				const owner = await this.membersRepository.findOne({
					where: { id: ownerId },
				});
				dbMemberGroup.owner = owner;
				dbMemberGroup.members = dbMembers;
			} else {
				throw new BadRequestException(
					"Member group owner must be a member of the group"
				);
			}
		} else if (ownerId) {
			const owner = await this.membersRepository.findOne({
				where: { id: ownerId },
			});
			const groupMemberIds = dbMemberGroup.members.map((member) => {
				return member.id;
			});
			if (groupMemberIds.includes(ownerId)) {
				dbMemberGroup.owner = owner;
			} else {
				throw new BadRequestException(
					"Member group owner must be a member of the group"
				);
			}
		} else if (memberIds) {
			const dbMembers = await this.membersRepository.find({
				where: { id: In(memberIds) },
			});
			if (!dbMemberGroup.owner) {
				dbMemberGroup.members = dbMembers;
			} else {
				const dbMemberIds = dbMembers.map((member) => {
					return member.id;
				});
				if (dbMemberIds.includes(ownerId)) {
					dbMemberGroup.members = dbMembers;
				} else {
					throw new BadRequestException(
						"Member group owner must be a member of the group"
					);
				}
			}
		}
		await this.groupsRepository.save(dbMemberGroup);
		return dbMemberGroup;
	}

	async remove(id: number): Promise<any> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const dbMemberGroup = await this.groupsRepository.findOne({
			where: { id: id },
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("Member group not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.DELETE,
				dbMemberGroup
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
		const result = await this.groupsRepository.delete({ id: dbMemberGroup.id });
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the group");
		}
		return result;
	}
}
