import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { InjectRepository } from "@nestjs/typeorm/dist/common";
import { In, Repository } from "typeorm";
import { Member } from "./entities/member.entity";
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
import { ForbiddenError } from "@casl/ability";
import { MemberGroup } from "../member-groups/entities/member-group.entity";
import { MemberRole } from "../member-roles/entities/member-role.entity";
import { uniq } from "lodash";
import { UpdateMemberGroupsDto } from "./dto/update-member-groups.dto";
import { MemberAuthService } from "../member-auth/member-auth.service";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { FreezeMemberDto } from "./dto/freeze-member.dto";

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
	constructor(
		@Inject(REQUEST)
		private request: any,
		private memberAuthService: MemberAuthService,
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
		@InjectRepository(MemberRole)
		private memberRolesRepository: Repository<MemberRole>,
		@InjectRepository(MemberGroup)
		private memberGroupsRepository: Repository<MemberGroup>,
		private caslAbilityFactory: CaslAbilityFactory
	) { }

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
		const defaultRole = await this.memberRolesRepository.findOne({
			where: { name: "default" },
		});
		const everyoneGroup = await this.memberGroupsRepository.findOne({
			where: { name: "everyone" },
		});
		const member = this.membersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			memberRoles: [defaultRole],
			memberGroups: [everyoneGroup],
		});
		await this.membersRepository.save(member);
		this.memberAuthService.sendVerificationEmail(email);
		return member;
	}

	/**
	 * Find members conditionally.
	 * Since CASL only determines "can" or "can not",
	 * this function only returns members belonging to owned groups of the requester only.
	 * @param email member email
	 * @param nickname member nickname
	 * @param roleIds member's role ids
	 * @returns member
	 */
	async find(
		email?: string,
		nickname?: string,
		roleIds?: any
	): Promise<Member[]> {
		const requester = this.request.user;
		const dbRequester = await this.membersRepository.findOne({
			where: { id: requester.id },
			relations: ["ownedGroups"],
		});
		const requesterOwnedGroupIds: number[] = dbRequester.ownedGroups.map(
			(group) => {
				return group.id;
			}
		);
		const memberQb = this.membersRepository
			.createQueryBuilder("member")
			.leftJoinAndSelect("member.memberRoles", "memberRoles")
			.leftJoinAndSelect("member.memberGroups", "memberGroups")
			.leftJoinAndSelect("member.ownedGroups", "ownedGroups");
		if (email) {
			memberQb.where("member.email = :email", { email: email.toLowerCase() });
		}
		if (nickname) {
			memberQb.andWhere("(LOWER(member.nickname) LIKE LOWER(:nickname))", {
				nickname: `%${nickname}%`,
			});
		}
		memberQb.andWhere("(memberGroups.id IN (:...groupIds))", {
			groupIds: requesterOwnedGroupIds,
		});
		let members = await memberQb.getMany();
		if (roleIds) {
			roleIds = roleIds.map((roleId) => {
				return parseInt(roleId);
			});
			members = members.filter((member) => {
				const memberRoleIds = member.memberRoles.map((role) => {
					return role.id;
				});
				for (const roleId of roleIds) {
					if (memberRoleIds.includes(roleId)) {
						return true;
					}
				}
				return false;
			});
		}
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
		const requester = this.request.user;
		const { ids } = findMembersByIdsDto;
		const members = await this.membersRepository.find({
			where: {
				id: In(ids),
			},
			relations: ["memberRoles", "memberGroups", "ownedGroups"],
		});
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		for (const member of members) {
			if (!ability.can(Actions.READ, member)) {
				throw new ForbiddenException();
			}
		}
		return members;
	}

	async findMe(): Promise<Member> {
		const requester = this.request.user;
		const dbRequester = await this.membersRepository.findOne({
			where: { id: requester.id },
			relations: ["memberRoles", "memberGroups", "ownedGroups"],
		});
		return dbRequester;
	}

	async memberVerification(id: string): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const member = await this.membersRepository.findOne({
			where: { id: id },
			relations: ["memberGroups"],
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, member)) {
			member.isVerified = true;
			const result = await this.membersRepository.save(member);
			return result;
		} else {
			throw new ForbiddenException();
		}
	}

	async update(
		id: string,
		updateMemberDto: Partial<UpdateMemberDto>
	): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const member = await this.membersRepository.findOne({
			where: { id: id },
			relations: ["memberRoles", "memberGroups"],
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, member)) {
			Object.assign(member, updateMemberDto);
			const result = await this.membersRepository.save(member);
			return result;
		} else {
			throw new ForbiddenException();
		}
	}

	async updateMemberEmail(
		id: string,
		updateMemberEmailDto: UpdateMemberEmailDto
	): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const member = await this.membersRepository.findOne({
			where: { id: id },
			relations: ["memberRoles", "memberGroups"],
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, member)) {
			Object.assign(member, updateMemberEmailDto);
			const result = await this.membersRepository.save(member);
			return result;
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
	 * @param updateMemberRolesDto
	 * @returns member
	 */
	async updateMemberRoles(
		id: string,
		updateMemberRolesDto: UpdateMemberRolesDto
	): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const adminRole = await this.memberRolesRepository.findOne({
			where: { name: "admin" },
			relations: ["members"],
		});
		const adminMemberId = adminRole.members[0].id;
		let member: Member;
		let memberRoles: MemberRole[];
		if (updateMemberRolesDto.roleIds) {
			if (id === adminMemberId) {
				if (!updateMemberRolesDto.roleIds.includes(adminRole.id)) {
					throw new ForbiddenException(
						"'admin' cannot be resigned without transferring it to another member"
					);
				}
			}
			if (
				id !== adminMemberId &&
				updateMemberRolesDto.roleIds.includes(adminRole.id)
			) {
				throw new ForbiddenException(
					"Can't assign the 'admin' role to other members"
				);
			}
			memberRoles = await this.memberRolesRepository.find({
				where: { id: In(updateMemberRolesDto.roleIds) },
			});
			if (memberRoles.length !== updateMemberRolesDto.roleIds.length) {
				throw new NotFoundException("At least one role not found");
			}
			member = await this.membersRepository.findOne({
				where: { id: id },
				relations: ["memberRoles", "memberGroups"],
			});
			if (!member) {
				throw new NotFoundException("Member not found");
			}
			const memberRoleIds = member.memberRoles.map((role) => {
				return role.id;
			});
			if (memberRoleIds.includes(adminRole.id)) {
				/* Requestee has 'admin' role */
				memberRoles.push(adminRole);
				memberRoles = uniq(memberRoles);
			}
		} else {
			throw new BadRequestException("Empty body, missing 'roleIds'");
		}
		if (ability.can(Actions.UPDATE, MemberRole)) {
			member.memberRoles = memberRoles;
			const result = await this.membersRepository.save(member);
			return result;
		} else {
			throw new ForbiddenException("Forbidden, can't update member roles");
		}
	}

	async updateMemberGroups(
		id: string,
		updateMemberGroupsDto: UpdateMemberGroupsDto
	): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const everyoneGroup = await this.memberGroupsRepository.findOne({
			where: { name: "everyone" },
		});
		let member: Member;
		let memberGroups: MemberGroup[];
		if (updateMemberGroupsDto.groupIds) {
			if (!updateMemberGroupsDto.groupIds.includes(everyoneGroup.id)) {
				throw new ForbiddenException(
					"All members belong to the 'everyone' group by default, you cannot remove any member from group 'everyone'"
				);
			}
			memberGroups = await this.memberGroupsRepository.find({
				where: { id: In(updateMemberGroupsDto.groupIds) },
			});
			member = await this.membersRepository.findOne({
				where: { id: id },
				relations: ["memberRoles", "memberGroups"],
			});
			if (!member) {
				throw new NotFoundException("Member not found");
			}
			const memberGroupIds = uniq(
				member.memberGroups.map((group) => {
					return group.id;
				})
			);
		} else {
			throw new BadRequestException("Empty body, missing 'groupIds'");
		}
		if (ability.can(Actions.UPDATE, MemberGroup)) {
			member.memberGroups = memberGroups;
			const result = await this.membersRepository.save(member);
			return result;
		} else {
			throw new ForbiddenException("Forbidden, can't update member groups");
		}
	}

	async updateMemberPassword(
		id: string,
		updateMemberPasswordDto: UpdateMemberPasswordDto
	): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const member = await this.membersRepository.findOne({ where: { id: id } });
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, member)) {
			const { oldPassword, newPassword } = updateMemberPasswordDto;
			const isOldPasswordCorrect: boolean = await bcrypt.compare(
				oldPassword,
				member.password
			);
			if (isOldPasswordCorrect) {
				if (oldPassword === newPassword) {
					throw new BadRequestException(
						"The new password cannot be the same as the old password"
					);
				}
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(newPassword, salt);
				member.password = hashedPassword;
				await this.membersRepository.save(member);
				return member;
			} else {
				throw new UnauthorizedException();
			}
		} else {
			throw new ForbiddenException();
		}
	}

	async updateAvatar(req: any, file: Express.Multer.File): Promise<any> {
		const { mimetype } = file;
		if (!req.user) {
			throw new UnauthorizedException();
		}
		if (mimetype === "image/png") {
			if (file.size > 1024 * 1024) {
				throw new BadRequestException("File size too large");
			}
			const directoryPath = `storage/app/avatar/${req.user.id}`;
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
		if (!req.user) {
			throw new UnauthorizedException();
		}
		const directoryPath = `storage/app/avatar/${id}`;
		const filePath = directoryPath + "/avatar.png";
		if (!existsSync(filePath)) {
			throw new NotFoundException("Avatar not found");
		}
		res.download(filePath);
	}

	async freeze(id: string, freezeMemberDto: FreezeMemberDto): Promise<Member> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const adminRole = await this.memberRolesRepository.findOne({
			where: { name: "admin" },
			relations: ["members"],
		});
		const admin = adminRole.members[0];
		const member = await this.membersRepository.findOne({
			where: { id: id },
			relations: ["memberGroups"],
		});
		if (id === admin.id) {
			throw new ForbiddenException("Can't freeze the 'admin' member");
		}
		if (requester.id === id) {
			throw new ForbiddenException("Can't freeze yourself");
		}
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.UPDATE, member);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		member.isFrozen = freezeMemberDto.isFrozen;
		const result = await this.membersRepository.save(member);
		return result;
	}

	async transferOwnership(id: string): Promise<{ isTransferred: boolean; }> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const adminRole = await this.memberRolesRepository.findOne({
			where: { name: "admin" },
			relations: ["members"],
		});
		const defaultRole = await this.memberRolesRepository.findOne({
			where: { name: "default" },
			relations: ["members"],
		});
		const admin = adminRole.members[0];
		if (requester.id !== admin.id) {
			throw new ForbiddenException(
				"Only the 'admin' member can transfer ownership"
			);
		}
		const everyoneGroup = await this.memberGroupsRepository.findOne({
			where: { name: "everyone" },
		});
		const member = await this.membersRepository.findOne({
			where: { id: id },
		});
		if (member.isFrozen) {
			throw new ForbiddenException(
				"Can't transfer ownership to a frozen member"
			);
		}
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		if (ability.can(Actions.UPDATE, MemberRole)) {
			adminRole.members = [member];
			everyoneGroup.owner = member;
		} else {
			throw new ForbiddenException("Forbidden, can't update member roles");
		}
		const adminRoleResult = await this.memberRolesRepository.save(adminRole);
		const everyoneGroupResult = await this.memberGroupsRepository.save(
			everyoneGroup
		);
		return { isTransferred: true };
	}

	async remove(id: string): Promise<any> {
		const requester = this.request.user;
		const ability = await this.caslAbilityFactory.defineAbilityFor(
			requester.id
		);
		const member = await this.membersRepository.findOne({
			where: { id: id },
			/* CASL need to check permissions as per memberRoles and memberGroups */
			relations: ["memberRoles", "memberGroups"],
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		try {
			ForbiddenError.from(ability).throwUnlessCan(Actions.DELETE, member);
		} catch (error) {
			if (error instanceof ForbiddenError) {
				throw new ForbiddenException(error.message);
			}
			throw error;
		}
		const result = await this.membersRepository.delete({ id: id });
		if (!result.affected) {
			throw new ServiceUnavailableException("Failed to delete the member");
		}
		return result;
	}
}
