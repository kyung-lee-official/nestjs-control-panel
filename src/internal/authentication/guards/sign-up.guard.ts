import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SignUpGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const serverSettings =
			await this.prismaService.memberServerSetting.findFirst();
		if (serverSettings?.allowPublicSignUp) {
			return true;
		} else {
			return false;
		}
	}
}
