import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { getCerbosPrincipal } from "src/utils/data";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class CreateMemberGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const action = "create";

		const cerbosObject = {
			principal: {
				id: requester.id,
				roles: requester.memberRoles.map((role) => role.id),
				attributes: principal,
			},
			resource: {
				kind: "internal:members",
				id: "*",
			},
			actions: [action],
		};
		const decision = await cerbos.checkResource(cerbosObject);

		const result = !!decision.isAllowed(action);

		return result;
	}
}
