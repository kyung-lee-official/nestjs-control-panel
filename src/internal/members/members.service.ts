import { REQUEST } from "@nestjs/core";
import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import bcrypt from "bcrypt";
import {
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common/exceptions";
import { FindMembersByIdsDto } from "./dto/find-members-by-ids.dto";
import { rm, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { FreezeMemberDto } from "./dto/freeze-member.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { Member, Prisma } from "@prisma/client";
import { FindMembersDto } from "./dto/find-members.dto";
import { MemberWithoutPassword } from "../../utils/types";
import { UpdateMemberProfileDto } from "./dto/update-member-profile.dto";
import { UtilsService } from "src/utils/utils.service";
import { CheckResourceRequest } from "@cerbos/core";
import { CerbosService } from "src/cerbos/cerbos.service";
import { ResendService } from "src/resend/resend.service";

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
	constructor(
		@Inject(REQUEST)
		private readonly request: any,
		private readonly resendService: ResendService,
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly cerbosService: CerbosService
	) {}

	async permissions() {
		const { requester } = this.request;

		const principal = await this.utilsService.getCerbosPrincipal(requester);
		const actions = ["*", "read", "update-profile", "delete", "freeze"];
		const resource = {
			kind: "internal:members",
			id: "*",
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision =
			await this.cerbosService.cerbos.checkResource(checkResourceRequest);

		return { ...decision };
	}

	async create(createMemberDto: CreateMemberDto) {
		let { email, name } = createMemberDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const password = await this.utilsService.generatePassword();
		const hashedPassword = await bcrypt.hash(password, salt);
		const member = await this.prismaService.member.create({
			data: {
				email,
				password: hashedPassword,
				name,
				isVerified: true,
				memberRoles: {
					connect: { id: "default" },
				},
			},
			include: {
				memberRoles: true,
			},
		});
		/* send initial password email */
		const htmlTemplate = (password: string) => `
						<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
							<h1>Hi, this is your initial password: 🗝️</h1>
							<p>${password}</p>
						</div>
					`;
		await this.resendService.sendEmail(
			email,
			"Your initial password 🗝️",
			htmlTemplate(password)
		);
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

	async getMeAndMembersOfMySubRoles(): Promise<Member[]> {
		const { requester } = this.request;
		const me = await this.prismaService.member.findUnique({
			where: { id: requester.id },
			include: {
				memberRoles: true,
			},
		});
		if (!me) {
			throw new NotFoundException("Member not found");
		}
		const memberRoleIds = requester.memberRoles.map((role) => role.id);
		const allSubRoleIds =
			await this.utilsService.getSubRolesOfRoles(memberRoleIds);
		const members = await this.prismaService.member.findMany({
			where: {
				memberRoles: {
					some: {
						id: {
							in: allSubRoleIds,
						},
					},
				},
			},
			include: {
				memberRoles: true,
			},
		});
		/* remove duplicates */
		const uniqueMembers = [me, ...members].filter((member, index, self) => {
			return (
				index ===
				self.findIndex(
					(m) => m.id === member.id && m.email === member.email
				)
			);
		});
		return uniqueMembers;
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

	async remove(id: string): Promise<Member> {
		const result = await this.prismaService.$transaction(async (tx) => {
			const member = await tx.member.findUnique({
				where: { id: id },
			});
			if (!member) {
				throw new NotFoundException("Member not found");
			}
			/* delete performance stats */
			const memberPerformanceStats = await tx.performanceStat.findMany({
				where: { ownerId: member.id },
			});
			for (const stat of memberPerformanceStats) {
				const statSections = await tx.statSection.findMany({
					where: { statId: stat.id },
				});
				for (const section of statSections) {
					const events = await tx.event.findMany({
						where: { sectionId: section.id },
					});
					for (const event of events) {
						/* delete event attachments */
						await rm(
							`./storage/internal/apps/performances/event-attachments/${event.id}`,
							{
								recursive: true,
								force: true,
							}
						);
						/* delete event comments */
						await tx.eventComment.deleteMany({
							where: { eventId: event.id },
						});
						/* delete event */
						await tx.event.delete({
							where: { id: event.id },
						});
					}
					/* delete section */
					await tx.statSection.delete({
						where: { id: section.id },
					});
				}
				/* delete stat */
				await tx.performanceStat.delete({
					where: { id: stat.id },
				});
			}
			/* delete avatar */
			const avatarPath = `./storage/internal/avatar/${member.id}`;
			if (existsSync(avatarPath)) {
				await rm(avatarPath, {
					recursive: true,
					force: true,
				});
			}
			/* delete member */
			const deletedRequestee = await tx.member.delete({
				where: { id: id },
			});
			return deletedRequestee;
		});
		return result;
	}
}
