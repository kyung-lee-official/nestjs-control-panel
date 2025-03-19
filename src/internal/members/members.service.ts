import { REQUEST } from "@nestjs/core";
import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import bcrypt from "bcrypt";
import {
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common/exceptions";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { Member, Prisma } from "@prisma/client";
import { FindMembersDto } from "./dto/find-members.dto";
import { MemberWithoutPassword } from "../../utils/types";
import { EmailService } from "../email/email.service";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly emailService: EmailService,
		private readonly prismaService: PrismaService
	) {}

	/**
	 * Create a new member.
	 * @param createMemberDto
	 * @returns member
	 */
	async create(createMemberDto: CreateMemberDto) {
		let { email, password, name } = createMemberDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const member = await this.prismaService.member.create({
			data: {
				email,
				password: hashedPassword,
				name,
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
	 * This function only returns members belonging to owned groups of the requester only.
	 * @returns member
	 */
	async search(findMembersDto: FindMembersDto): Promise<Member[]> {
		const { email, name } = findMembersDto;
		let members = await this.prismaService.member.findMany({
			where: {
				email: email ? email : Prisma.skip,
				name: name ? { contains: name } : Prisma.skip,
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
		const { name } = updateMemberProfileDto;
		const member = await this.prismaService.member.update({
			where: { id: id },
			data: {
				name: name,
			},
			include: {
				memberRoles: true,
			},
		});
		return member;
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
			const directoryPath = `storage/internal/avatar/${req.requester.id}`;
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
		const directoryPath = `storage/internal/avatar/${id}`;
		const filePath = directoryPath + "/avatar.png";
		if (!existsSync(filePath)) {
			throw new NotFoundException("Avatar not found");
		}
		res.download(filePath);
	}

	async freeze(id: string, freezeMemberDto: FreezeMemberDto) {
		const { isFrozen } = freezeMemberDto;
		const frozenRequestee = await this.prismaService.member.update({
			where: { id: id },
			data: { isFrozen: isFrozen },
		});
		return frozenRequestee;
	}

	async transferMemberAdmin(id: string) {
		await this.prismaService.memberRole.update({
			where: { id: "admin" },
			data: {
				members: {
					set: [{ id: id }],
				},
			},
		});

		/* Move the old admin to the default role if the old admin is not in any role */
		const oldAdmin = await this.prismaService.member.findUnique({
			where: { id: this.request.requester.id },
			include: {
				memberRoles: true,
			},
		});
		if (oldAdmin?.memberRoles.length === 0) {
			await this.prismaService.memberRole.update({
				where: { id: "default" },
				data: {
					members: {
						connect: { id: this.request.requester.id },
					},
				},
			});
		}

		const newAdmin = await this.prismaService.member.findUnique({
			where: { id: id },
			include: {
				memberRoles: true,
			},
		});
		return newAdmin;
	}

	async remove(id: string): Promise<Member> {
		const deletedRequestee = await this.prismaService.member.delete({
			where: { id: id },
		});
		return deletedRequestee;
	}
}
