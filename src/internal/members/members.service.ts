import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import bcrypt from "bcrypt";
import { REQUEST } from "@nestjs/core";
import {
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from "@nestjs/common/exceptions";
import { UpdateMemberEmailDto } from "./dto/update-member-email.dto";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { Member } from "@prisma/client";
import { FindMembersDto } from "./dto/find-members.dto";
import { MemberWithoutPassword } from "../../utils/types";
import { EmailService } from "../email/email.service";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";
import { UpdateMyPasswordDto } from "./dto/update-my-password.dto";

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly emailService: EmailService,
		private readonly prismaService: PrismaService
	) {}

	/**
	 * Create a new member, and assign to the "everyone" group.
	 * @param createMemberDto
	 * @returns member
	 */
	async create(createMemberDto: CreateMemberDto) {
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
					connect: { id: "default" },
				},
			},
			include: {
				memberRoles: true,
			},
		});
		this.emailService.sendVerificationEmail(email);
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
		let members = await this.prismaService.member.findMany({
			where: {
				email: email ? email : undefined,
				nickname: nickname ? { contains: nickname } : undefined,
			},
			include: {
				memberRoles: true,
			},
		});
		return members;
	}

	/**
	 * Find members by ids. If unknown ids exist in findMembersByIdsDto, ignore them, doesn't throw.
	 * @param findMembersByIdsDto
	 * @returns members
	 */
	async findMembersByIds(findMembersByIdsDto: FindMembersByIdsDto) {
		const { ids } = findMembersByIdsDto;
		const members = await this.prismaService.member.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				memberRoles: true,
			},
		});
		return members;
	}

	async findMe(): Promise<MemberWithoutPassword> {
		const { requester } = this.request;
		return requester;
	}

	async memberVerification(id: string): Promise<Member> {
		const member = await this.prismaService.member.update({
			where: { id: id },
			data: {
				isVerified: true,
			},
			include: {
				memberRoles: true,
			},
		});
		return member;
	}

	async updateProfile(
		id: string,
		updateMemberProfileDto: UpdateMemberProfileDto
	): Promise<Member> {
		const member = await this.prismaService.member.update({
			where: { id: id },
			data: updateMemberProfileDto,
			include: {
				memberRoles: true,
			},
		});
		return member;
	}

	async updateMemberEmail(
		id: string,
		updateMemberEmailDto: UpdateMemberEmailDto
	) {
		const { email } = updateMemberEmailDto;
		const member = await this.prismaService.member.update({
			where: { id: id },
			data: { email: email },
			include: {
				memberRoles: true,
			},
		});
		return member;
	}

	async updateMyPassword(updateMemberPasswordDto: UpdateMyPasswordDto) {
		const { requester } = this.request;
		const { oldPassword, newPassword } = updateMemberPasswordDto;
		const isOldPasswordCorrect: boolean = await bcrypt.compare(
			oldPassword,
			requester.password
		);
		if (isOldPasswordCorrect) {
			if (oldPassword === newPassword) {
				throw new BadRequestException(
					"The new password cannot be the same as the old password"
				);
			}
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(newPassword, salt);
			const newRequester = await this.prismaService.member.update({
				where: { id: requester.id },
				data: { password: hashedPassword },
			});
			return newRequester;
		} else {
			throw new UnauthorizedException("Incorrect password");
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

	async freeze(id: string, freezeMemberDto: FreezeMemberDto) {
		const { isFrozen } = freezeMemberDto;
		// if (id === admin.id) {
		// 	throw new ForbiddenException("Can't freeze the 'admin' member");
		// }
		// if (requester.id === id) {
		// 	throw new ForbiddenException("Can't freeze yourself");
		// }
		const frozenRequestee = await this.prismaService.member.update({
			where: { id: id },
			data: { isFrozen: isFrozen },
		});
		return frozenRequestee;
	}

	async transferMemberAdmin(id: string) {
		console.log(" ========== id ========== ", id);

		const { requester } = this.request;
		// const ability =
		// 	await this.caslAbilityFactory.defineAbilityFor(requester);
		const adminRole = await this.prismaService.memberRole.findUnique({
			where: { id: "admin" },
			include: {
				members: true,
			},
		});

		// if (requester.id !== admin.id) {
		// 	throw new ForbiddenException(
		// 		"You're not the admin, can't transfer ownership"
		// 	);
		// }

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
			where: { id: "admin" },
			data: {
				members: {
					set: { id: id },
				},
			},
		});
		// await this.prismaService.memberGroup.update({
		// 	where: { name: "everyone" },
		// 	data: {
		// 		owner: {
		// 			connect: { id: id },
		// 		},
		// 	},
		// });

		const newAdmin = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberRoles: true,
			},
		});
		return newAdmin;
	}

	async remove(id: string): Promise<Member> {
		const { requester } = this.request;
		// const ability =
		// 	await this.caslAbilityFactory.defineAbilityFor(requester);
		const requestee = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				/* CASL need to check permissions as per memberRoles and memberGroups */
				memberRoles: true,
			},
		});
		if (!requestee) {
			throw new NotFoundException("Member not found");
		}
		// try {
		// 	ForbiddenError.from(ability).throwUnlessCan(
		// 		Actions.DELETE,
		// 		subject("Member", requestee)
		// 	);
		// } catch (error) {
		// 	if (error instanceof ForbiddenError) {
		// 		throw new ForbiddenException(error.message);
		// 	}
		// 	throw error;
		// }
		const deletedRequestee = await this.prismaService.member.delete({
			where: { id: id },
		});
		return deletedRequestee;
	}
}
