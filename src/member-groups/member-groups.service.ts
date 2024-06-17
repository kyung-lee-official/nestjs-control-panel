import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
	ServiceUnavailableException,
} from "@nestjs/common";
import { UpdateMemberGroupDto } from "./dto/update-member-group.dto";
import { REQUEST } from "@nestjs/core";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError, subject } from "@casl/ability";
import { TransferMemberGroupOwnershipDto } from "./dto/transfer-member-group-ownershiop.dto";
import { PrismaService } from "../prisma/prisma.service";
import { MemberGroup } from "@prisma/client";

@Injectable({ scope: Scope.REQUEST })
export class MemberGroupsService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private readonly prismaService: PrismaService,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	private async generateNewMemberGroupName(newMemberGroupNameIndex: number) {
		let newMemberGroupName = "New Group";
		if (newMemberGroupNameIndex === 0) {
			newMemberGroupName = "New Group";
		} else {
			newMemberGroupName = "New Group" + newMemberGroupNameIndex;
		}
		let newMemberGroup = await this.prismaService.memberGroup.findUnique({
			where: {
				name: newMemberGroupName,
			},
		});
		if (newMemberGroup) {
			newMemberGroupNameIndex++;
			return await this.generateNewMemberGroupName(
				newMemberGroupNameIndex
			);
		} else {
			return newMemberGroupName;
		}
	}

	async create(): Promise<MemberGroup> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const newMemberGroupName: string =
			await this.generateNewMemberGroupName(0);
		try {
			/**
			 * Here the exact subject instance is required instead of the Subject type
			 * because the subject name need to match the conditions in the AbilityFactory
			 */
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.CREATE,
				subject("MemberGroup", { name: newMemberGroupName } as any)
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}

		const memberGroup = await this.prismaService.memberGroup.create({
			data: {
				name: newMemberGroupName,
				owner: {
					connect: {
						id: requester.id,
					},
				},
				members: {
					connect: [
						{
							id: requester.id,
						},
					],
				},
			},
		});

		return memberGroup;
	}

	async findAll(): Promise<MemberGroup[]> {
		const memberGroups = await this.prismaService.memberGroup.findMany({
			include: {
				owner: true,
				members: true,
			},
		});
		return memberGroups;
	}

	async findOne(id: number): Promise<MemberGroup> {
		const memberGroup = await this.prismaService.memberGroup.findUnique({
			where: {
				id: id,
			},
			include: {
				owner: true,
				members: true,
			},
		});
		if (!memberGroup) {
			throw new NotFoundException("member-group not found");
		}
		return memberGroup;
	}

	async update(
		id: number,
		updateMemberGroupDto: Partial<UpdateMemberGroupDto>
	): Promise<MemberGroup> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const dbMemberGroup = await this.prismaService.memberGroup.findUnique({
			where: { id: id },
			include: {
				owner: true,
				members: true,
			},
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("member-group not found");
		}
		const { name, memberIds } = updateMemberGroupDto;
		if (name) {
			if (
				ability.cannot(
					Actions.UPDATE,
					subject("MemberGroup", dbMemberGroup),
					"name"
				)
			) {
				const reason = ability.relevantRuleFor(
					Actions.UPDATE,
					subject("MemberGroup", dbMemberGroup),
					"name"
				);
				throw new ForbiddenException(reason);
			}
		}
		if (memberIds) {
			if (
				ability.cannot(
					Actions.UPDATE,
					subject("MemberGroup", dbMemberGroup),
					"members"
				)
			) {
				const reason = ability.relevantRuleFor(
					Actions.UPDATE,
					subject("MemberGroup", dbMemberGroup),
					"members"
				).reason;
				throw new ForbiddenException(reason);
			}
			const dbRequester = await this.prismaService.member.findUnique({
				where: {
					id: requester.id,
				},
				include: {
					memberRoles: true,
				},
			});
			if (
				dbRequester.memberRoles.find(
					(memberRole) => memberRole.name === "admin"
				)
			) {
				/* Requester is admin */
				const admin = dbRequester;
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
				}
			} else {
				/* Requester is not admin */
				if (!memberIds.includes(dbMemberGroup.owner.id)) {
					throw new BadRequestException(
						"member-group owner is missing from the memberIds array"
					);
				} else {
					/* New members include the original owner, simply update the members */
				}
			}
		}
		const memberGroup = await this.prismaService.memberGroup.update({
			where: { id: id },
			data: {
				name: name,
				members: {
					connect: memberIds.map((memberId) => {
						return { id: memberId };
					}),
				},
			},
		});
		return memberGroup;
	}

	async transferOwnership(
		id: number,
		transferMemberGroupOwnershipDto: TransferMemberGroupOwnershipDto
	): Promise<MemberGroup> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const dbMemberGroup = await this.prismaService.memberGroup.findUnique({
			where: { id: id },
			include: {
				owner: true,
				members: true,
			},
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("member-group not found");
		}
		const { ownerId } = transferMemberGroupOwnershipDto;
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.UPDATE,
				subject("MemberGroup", dbMemberGroup),
				"owner"
			);
			const groupMemberIds = dbMemberGroup.members.map((member) => {
				return member.id;
			});
			if (!groupMemberIds.includes(ownerId)) {
				throw new BadRequestException(
					"member-group owner must be a member of the group"
				);
			} else {
				/* Can transfer ownership */
			}
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const memberGroup = await this.prismaService.memberGroup.update({
			where: { id: id },
			data: {
				owner: {
					connect: {
						id: ownerId,
					},
				},
			},
		});
		return memberGroup;
	}

	async remove(id: number): Promise<any> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const dbMemberGroup = await this.prismaService.memberGroup.findUnique({
			where: { id: id },
		});
		if (!dbMemberGroup) {
			throw new NotFoundException("member-group not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.DELETE,
				subject("MemberGroup", dbMemberGroup)
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const result = await this.prismaService.memberGroup.delete({
			where: { id: dbMemberGroup.id },
		});
		return result;
	}
}
