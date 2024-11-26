import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest } from "@cerbos/core";
import { getCerbosPrincipal } from "src/utils/data";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class GetServerSettingsGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["read"];

		const serverSettings =
			await this.prismaService.memberServerSetting.findFirst();
		if (!serverSettings) {
			throw new NotFoundException("Server settings not found");
		}

		const resource = {
			kind: "internal:server-settings",
			id: "*",
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);
		const result = !!decision.isAllowed("read");

		return result;
	}
}
