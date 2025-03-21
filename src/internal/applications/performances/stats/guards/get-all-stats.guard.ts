import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest, Principal, Resource } from "@cerbos/core";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class GetAllStatsGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly utilsService: UtilsService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		const requester = req.requester;
		const principal: Principal =
			await this.utilsService.getCerbosPrincipal(requester);

		const actions = ["read"];

		const resource: Resource = {
			kind: "internal:applications:performances:stat",
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
