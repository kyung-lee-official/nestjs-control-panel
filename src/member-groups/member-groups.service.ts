import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
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
import { TransferMemberGroupOwnershipDto } from "./dto/transfer-member-group-ownershiop.dto";

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
	) {}

	async create(): Promise<MemberGroup> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const groupsRepository = this.groupsRepository;
		async function generateNewMemberGroupName(
			newMemberGroupNameIndex: number
		) {
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
				return await generateNewMemberGroupName(
					newMemberGroupNameIndex
				);
			} else {
				return newMemberGroupName;
			}
		}
		const newMemberGroupName = await generateNewMemberGroupName(0);
		const memberGroup = this.groupsRepository.create({
			name: newMemberGroupName,
			owner: requester,
			members: [requester],
		});

		try {
			/**
			 * Here the exact subject instance is required instead of the Subject type
			 * because the subject name need to match the conditions in the AbilityFactory
			 */
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.CREATE,
				memberGroup
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
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
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const dbMemberGroup = await this.groupsRepository.findOne({
			where: { id: id },
			relations: ["owner", "members"],
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("Member Group not found");
		}
		const { name, memberIds } = updateMemberGroupDto;
		if (name) {
			try {
				ForbiddenError.from(ability).throwUnlessCan(
					Actions.UPDATE,
					dbMemberGroup,
					"name"
				);
				dbMemberGroup.name = name;
			} catch (error) {
				if (error instanceof ForbiddenError) {
					throw new ForbiddenException(error.message);
				}
				throw error;
			}
		}
		if (memberIds) {
			try {
				ForbiddenError.from(ability).throwUnlessCan(
					Actions.UPDATE,
					dbMemberGroup,
					"memberIds"
				);
				if (
					requester.memberRoles.find(
						(memberRole) => memberRole.name === "admin"
					)
				) {
					/* Requester is admin */
					const admin = requester;
					if (!memberIds.includes(dbMemberGroup.owner.id)) {
						/* New members do not include the original owner */
						if (admin.id === dbMemberGroup.owner.id) {
							/* Original owner is admin */
							throw new ForbiddenException(
								"admin is the owner of the member-group, but admin id is not included in the memberIds array"
							);
						} else {
							/* Original owner is not adimn, assign admin as the owner */
							dbMemberGroup.owner = admin;
						}
					} else {
						/* New members include the original owner, simply update the members */
						const dbMembers = await this.membersRepository.find({
							where: { id: In(memberIds) },
						});
						dbMemberGroup.members = dbMembers;
					}
				} else {
					/* Requester is not admin */
					if (!memberIds.includes(dbMemberGroup.owner.id)) {
						throw new BadRequestException(
							"Member group owner is missing from the memberIds array"
						);
					} else {
						const dbMembers = await this.membersRepository.find({
							where: { id: In(memberIds) },
						});
						dbMemberGroup.members = dbMembers;
					}
				}
			} catch (error) {
				if (error instanceof ForbiddenError) {
					throw new ForbiddenException(error.message);
				}
				throw error;
			}
		}
		await this.groupsRepository.save(dbMemberGroup);
		return dbMemberGroup;
	}

	async tranferOwnership(
		id: number,
		transferMemberGroupOwnershipDto: TransferMemberGroupOwnershipDto
	): Promise<MemberGroup> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const dbMemberGroup = await this.groupsRepository.findOne({
			where: { id: id },
			relations: ["owner", "members"],
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("Member Group not found");
		}
		const { ownerId } = transferMemberGroupOwnershipDto;
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.UPDATE,
				dbMemberGroup,
				"owner"
			);
			const groupMemberIds = dbMemberGroup.members.map((member) => {
				return member.id;
			});
			if (!groupMemberIds.includes(ownerId)) {
				throw new BadRequestException(
					"Member group owner must be a member of the group"
				);
			} else {
				const owner = await this.membersRepository.findOne({
					where: { id: ownerId },
				});
				dbMemberGroup.owner = owner;
			}
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		await this.groupsRepository.save(dbMemberGroup);
		return dbMemberGroup;
	}

	async remove(id: number): Promise<any> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
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
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const result = await this.groupsRepository.delete({
			id: dbMemberGroup.id,
		});
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the group");
		}
		return result;
	}
}
