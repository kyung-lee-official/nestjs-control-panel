import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class TransferAdminGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["transfer-admin"];

		const member = await this.prismaService.member.findUnique({
			where: {
				id: req.params.id,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}

		const resource = {
			kind: "internal:members",
			id: `${member.id}`,
			attr: {
				...member,
				createdAt: member.createdAt.toISOString(),
				updatedAt: member.updatedAt.toISOString(),
			},
		};

		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: resource,
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("transfer-admin");

		return result;
	}
}
