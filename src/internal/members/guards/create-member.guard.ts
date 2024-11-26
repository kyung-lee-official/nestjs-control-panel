import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { getCerbosPrincipal } from "src/utils/data";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class CreateMemberGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["create"];

		const resource = {
			kind: "internal:members",
			id: "*",
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("create");

		return result;
	}
}
