import {
	CanActivate,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AllowPublicSignUpGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const dbSettingsCount =
			await this.prismaService.memberServerSetting.count();
		if (dbSettingsCount !== 1) {
			throw new InternalServerErrorException(
				"Illegitimate, more then 1 server setting was found."
			);
		}
		const setting =
			await this.prismaService.memberServerSetting.findFirst();
		if (setting.allowPublicSignUp) {
			return true;
		} else {
			return false;
		}
	}
}
