import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class TransferAdminGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const member = await this.prismaService.member.findUnique({
			where: {
				id: req.params.id,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}

		const resource = {
			...member,
			createdAt: member.createdAt.toISOString(),
			updatedAt: member.updatedAt.toISOString(),
		};

		const action = "transfer-admin";

		const cerbosObject = {
			principal: {
				id: requester.id,
				roles: requester.memberRoles.map((role) => role.id),
				attributes: principal,
			},
			resource: {
				kind: "internal:members",
				id: `${resource.id}`,
				attributes: resource,
			},
			actions: [action],
		};
		const decision = await cerbos.checkResource(cerbosObject);

		const result = !!decision.isAllowed(action);

		return result;
	}
}
