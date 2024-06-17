import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import bcrypt from "bcrypt";
import { REQUEST } from "@nestjs/core";
import {
	BadRequestException,
	ForbiddenException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common/exceptions";
import { UpdateMemberEmailDto } from "./dto/update-member-email.dto";
import { UpdateMemberRolesDto } from "./dto/update-member-roles.dto";
import { UpdateMemberPasswordDto } from "./dto/update-member-password.dto";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import {
	Actions,
	CaslAbilityFactory,
} from "../casl/casl-ability.factory/casl-ability.factory";
import { ForbiddenError, subject } from "@casl/ability";
import { uniq } from "lodash";
import { UpdateMemberGroupsDto } from "./dto/update-member-groups.dto";
import { MemberAuthService } from "../member-auth/member-auth.service";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Member, MemberRole } from "@prisma/client";
import { FindMembersDto } from "./dto/find-members.dto";
import { MemberWithoutPassword } from "../utils/types";

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private memberAuthService: MemberAuthService,
		private caslAbilityFactory: CaslAbilityFactory,
		private readonly prismaService: PrismaService
	) {}

	/**
	 * Create a new member, and assign to the "everyone" group.
	 * @param createMemberDto
	 * @returns member
	 */
	async create(createMemberDto: CreateMemberDto): Promise<Member> {
		let { email, password, nickname } = createMemberDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const member = await this.prismaService.member.create({
			data: {
				email,
				password: hashedPassword,
				nickname,
				memberRoles: {
					connect: { name: "default" },
				},
				memberGroups: {
					connect: { name: "everyone" },
				},
			},
			include: {
				memberRoles: true,
				memberGroups: true,
				ownedGroups: true,
			},
		});
		this.memberAuthService.sendVerificationEmail(email);
		return member;
	}

	/**
	 * Find a members conditionally.
	 * Since CASL only determines "can" or "cannot",
	 * this function only returns members belonging to owned groups of the requester only.
	 * @returns member
	 */
	async find(findMembersDto: FindMembersDto): Promise<Member[]> {
		const { email, nickname } = findMembersDto;
		const { requester } = this.request;
		const requesterOwnedGroupIds: number[] = requester.ownedGroups.map(
			(group: any) => {
				return group.id;
			}
		);
		let members = await this.prismaService.member.findMany({
			where: {
				email: email ? email.toLowerCase() : undefined,
				nickname: nickname ? { contains: nickname } : undefined,
				memberGroups: {
					some: {
						id: {
							in: requesterOwnedGroupIds,
						},
					},
				},
			},
			include: {
				memberRoles: true,
				memberGroups: true,
				ownedGroups: true,
			},
		});
		return members;
	}

	/**
	 * Find members by ids. If unknown ids exist in findMembersByIdsDto, ignore them, doesn't throw.
	 * @param findMembersByIdsDto
	 * @returns members
	 */
	async findMembersByIds(
		findMembersByIdsDto: FindMembersByIdsDto
	): Promise<Member[]> {
		const { requester } = this.request;
		const { ids } = findMembersByIdsDto;
		const members = await this.prismaService.member.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				memberRoles: true,
				memberGroups: true,
				ownedGroups: true,
			},
		});
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		for (const member of members) {
			if (!ability.can(Actions.READ, subject("Member", member))) {
				throw new ForbiddenException();
			}
		}
		return members;
	}

	async findMe(): Promise<MemberWithoutPassword> {
		const { requester } = this.request;
		return requester;
	}

	async memberVerification(id: string): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const member = await this.prismaService.member.findUnique({
			where: {
				id: id,
			},
			include: {
				memberRoles: true,
				memberGroups: true,
				ownedGroups: true,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, subject("Member", member))) {
			const member = await this.prismaService.member.update({
				where: { id: id },
				data: {
					isVerified: true,
				},
				include: {
					memberRoles: true,
					memberGroups: true,
					ownedGroups: true,
				},
			});
			return member;
		} else {
			throw new ForbiddenException();
		}
	}

	async update(
		id: string,
		updateMemberDto: Partial<UpdateMemberDto>
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const member = await this.prismaService.member.findUnique({
			where: {
				id: id,
			},
			include: {
				memberRoles: true,
				memberGroups: true,
				ownedGroups: true,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, subject("Member", member))) {
			const member = await this.prismaService.member.update({
				where: { id: id },
				data: updateMemberDto,
				include: {
					memberRoles: true,
					memberGroups: true,
					ownedGroups: true,
				},
			});
			return member;
		} else {
			throw new ForbiddenException();
		}
	}

	async updateMemberEmail(
		id: string,
		updateMemberEmailDto: UpdateMemberEmailDto
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const member = await this.prismaService.member.findUnique({
			where: {
				id: id,
			},
			include: {
				memberRoles: true,
				memberGroups: true,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, subject("Member", member))) {
			const { email } = updateMemberEmailDto;
			const member = await this.prismaService.member.update({
				where: { id: id },
				data: { email: email.toLowerCase() },
				include: {
					memberRoles: true,
					memberGroups: true,
				},
			});
			return member;
		} else {
			throw new ForbiddenException();
		}
	}

	/**
	 * Update member's roles.
	 * If the requestee is not an admin member, and the 'admin' role is included in updateMemberRolesDto, throw a forbidden exception.
	 * If the requestee is an admin member, and the 'admin' role is not included in updateMemberRolesDto, throw a forbidden exception.
	 * If the 'default' role is not included in updateMemberRolesDto, throw a forbidden exception.
	 * If updateMemberRolesDto contains unknown roleIds, throw a not found exception.
	 * @param id requestee's id
	 * @param updateMemberRolesDto
	 * @returns member
	 */
	async updateMemberRoles(
		id: string,
		updateMemberRolesDto: UpdateMemberRolesDto
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const { newRoleIds } = updateMemberRolesDto;
		const adminRole = await this.prismaService.memberRole.findUnique({
			where: { name: "admin" },
			include: {
				members: true,
			},
		});
		const adminMemberId = adminRole.members[0].id;

		if (id === adminMemberId) {
			if (!newRoleIds.includes(adminRole.id)) {
				throw new ForbiddenException(
					"'admin' cannot be resigned without transferring it to another member"
				);
			}
		}
		if (id !== adminMemberId && newRoleIds.includes(adminRole.id)) {
			throw new ForbiddenException(
				"Can't assign the 'admin' role to other members"
			);
		}
		const newRoles = await this.prismaService.memberRole.findMany({
			where: { id: { in: newRoleIds } },
		});
		if (newRoles.length !== newRoleIds.length) {
			throw new NotFoundException("At least one role not found");
		}

		const dbRequestee = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberRoles: true,
				memberGroups: true,
			},
		});
		if (!dbRequestee) {
			throw new NotFoundException("Requestee not found");
		}
		const dbRequesteeRoleIds = dbRequestee.memberRoles.map(
			(role: MemberRole) => {
				return role.id;
			}
		);

		if (ability.can(Actions.UPDATE, subject("Member", dbRequestee))) {
			if (dbRequesteeRoleIds.includes(adminRole.id)) {
				/* Requestee originally has 'admin' role */
				newRoleIds.push(adminRole.id);
				const uniqueNewRoleIds = uniq(newRoleIds);
				const newRequestee = await this.prismaService.member.update({
					where: { id: id },
					data: {
						memberRoles: {
							connect: uniqueNewRoleIds.map((roleId) => {
								return { id: roleId };
							}),
						},
					},
					include: {
						memberRoles: true,
						memberGroups: true,
					},
				});
				return newRequestee;
			} else {
				/* Requestee originally doesn't have 'admin' role */
				const newRequestee = await this.prismaService.member.update({
					where: { id: id },
					data: {
						memberRoles: {
							connect: newRoleIds.map((roleId) => {
								return { id: roleId };
							}),
						},
					},
					include: {
						memberRoles: true,
						memberGroups: true,
					},
				});
				return newRequestee;
			}
		} else {
			throw new ForbiddenException(
				"Forbidden, can't update member-roles"
			);
		}
	}

	async updateMemberGroups(
		id: string,
		updateMemberGroupsDto: UpdateMemberGroupsDto
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const { newGroupIds } = updateMemberGroupsDto;
		const everyoneGroup = await this.prismaService.memberGroup.findUnique({
			where: { name: "everyone" },
		});

		if (!newGroupIds.includes(everyoneGroup.id)) {
			throw new ForbiddenException(
				"All members belong to the 'everyone' group, you cannot remove any member from group 'everyone'"
			);
		}

		const dbRequestee = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberRoles: true,
				memberGroups: true,
			},
		});
		if (!dbRequestee) {
			throw new NotFoundException("Member not found");
		}

		if (ability.can(Actions.UPDATE, subject("Member", dbRequestee))) {
			const newRequestee = await this.prismaService.member.update({
				where: { id: id },
				data: {
					memberGroups: {
						connect: newGroupIds.map((groupId) => {
							return { id: groupId };
						}),
					},
				},
				include: {
					memberRoles: true,
					memberGroups: true,
				},
			});
			return newRequestee;
		} else {
			throw new ForbiddenException(
				"Forbidden, can't update member-groups"
			);
		}
	}

	async updateMemberPassword(
		id: string,
		updateMemberPasswordDto: UpdateMemberPasswordDto
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const requestee = await this.prismaService.member.findUnique({
			where: { id: id },
		});
		if (!requestee) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, subject("Member", requestee))) {
			const { oldPassword, newPassword } = updateMemberPasswordDto;
			const isOldPasswordCorrect: boolean = await bcrypt.compare(
				oldPassword,
				requestee.password
			);
			if (isOldPasswordCorrect) {
				if (oldPassword === newPassword) {
					throw new BadRequestException(
						"The new password cannot be the same as the old password"
					);
				}
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(newPassword, salt);
				const newRequestee = await this.prismaService.member.update({
					where: { id: id },
					data: { password: hashedPassword },
				});
				return newRequestee;
			} else {
				throw new UnauthorizedException();
			}
		} else {
			throw new ForbiddenException();
		}
	}

	async updateAvatar(req: any, file: Express.Multer.File): Promise<any> {
		const { mimetype } = file;
		if (!req.requester) {
			throw new UnauthorizedException();
		}
		if (mimetype === "image/png") {
			if (file.size > 1024 * 1024) {
				throw new BadRequestException("File size too large");
			}
			const directoryPath = `storage/app/avatar/${req.requester.id}`;
			if (!existsSync(directoryPath)) {
				mkdirSync(directoryPath, { recursive: true });
			}
			const filePath = directoryPath + "/avatar.png";
			await writeFile(filePath, file.buffer);
			return { message: "Avatar updated" };
		} else {
			throw new BadRequestException("Only png images are allowed");
		}
	}

	async downloadAvatar(id: string, req: any, res: any): Promise<any> {
		if (!req.requester) {
			throw new UnauthorizedException();
		}
		const directoryPath = `storage/app/avatar/${id}`;
		const filePath = directoryPath + "/avatar.png";
		if (!existsSync(filePath)) {
			throw new NotFoundException("Avatar not found");
		}
		res.download(filePath);
	}

	async freeze(
		id: string,
		freezeMemberDto: FreezeMemberDto
	): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const { isFrozen } = freezeMemberDto;
		const adminRole = await this.prismaService.memberRole.findUnique({
			where: { name: "admin" },
			include: {
				members: true,
			},
		});
		const admin = adminRole.members[0];
		const requestee = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberGroups: true,
			},
		});
		if (id === admin.id) {
			throw new ForbiddenException("Can't freeze the 'admin' member");
		}
		if (requester.id === id) {
			throw new ForbiddenException("Can't freeze yourself");
		}
		if (!requestee) {
			throw new NotFoundException("Member not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.UPDATE,
				subject("Member", requestee)
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const frozenRequestee = await this.prismaService.member.update({
			where: { id: id },
			data: { isFrozen: isFrozen },
			include: {
				memberGroups: true,
			},
		});
		return frozenRequestee;
	}

	async transferMemberAdmin(id: string): Promise<Member> {
		console.log(" ========== id ========== ", id);
		
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const adminRole = await this.prismaService.memberRole.findUnique({
			where: { name: "admin" },
			include: {
				members: true,
			},
		});

		const admin = adminRole.members[0];
		if (requester.id !== admin.id) {
			throw new ForbiddenException(
				"You're not the admin, can't transfer ownership"
			);
		}

		const requestee = await this.prismaService.member.findUnique({
			where: { id: id },
		});
		if (!requestee) {
			throw new NotFoundException("Member not found");
		}
		if (requestee.isFrozen) {
			throw new ForbiddenException(
				"Can't transfer ownership to a frozen member"
			);
		}

		await this.prismaService.memberRole.update({
			where: { name: "admin" },
			data: {
				members: {
					set: { id: id },
				},
			},
		});
		await this.prismaService.memberGroup.update({
			where: { name: "everyone" },
			data: {
				owner: {
					connect: { id: id },
				},
			},
		});

		const newAdmin = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberRoles: true,
				ownedGroups: true,
			},
		});
		return newAdmin;
	}

	async remove(id: string): Promise<Member> {
		const { requester } = this.request;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester
		);
		const requestee = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				/* CASL need to check permissions as per memberRoles and memberGroups */
				memberRoles: true,
				memberGroups: true,
			},
		});
		if (!requestee) {
			throw new NotFoundException("Member not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(
				Actions.DELETE,
				subject("Member", requestee)
			);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const deletedRequestee = await this.prismaService.member.delete({
			where: { id: id },
		});
		return deletedRequestee;
	}
}
