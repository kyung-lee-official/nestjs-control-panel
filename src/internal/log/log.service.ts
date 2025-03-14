import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LogService {
	constructor(private readonly prismaService: PrismaService) {}

	async createSignInLog(memberId: string) {
		const member = await this.prismaService.member.findUnique({
			where: { id: memberId },
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		const log = await this.prismaService.eventLog.create({
			data: {
				memberId: member.id,
				memberName: member.name,
				eventType: "SIGN_IN",
			},
		});
		return log;
	}

	async getLogs(page: number) {
		if (page < 1) {
			throw new BadRequestException("Page number must be 1 or greater");
		}
		const logs = await this.prismaService.eventLog.findMany({
			take: 10,
			skip: (page - 1) * 10,
			orderBy: { createdAt: "desc" },
		});
		return logs;
	}
}
