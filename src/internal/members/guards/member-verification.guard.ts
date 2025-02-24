import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { getCerbosPrincipal } from "src/utils/data";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class MemberVerificationGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const member = await this.prismaService.member.findUnique({
			where: {
				email: req.jwtPayload.email,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}

		const actions = ["verify"];

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

		const result = !!decision.isAllowed("verify");

		return result;
	}
}
