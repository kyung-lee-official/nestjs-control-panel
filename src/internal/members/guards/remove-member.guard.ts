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
export class RemoveMemberGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["remove"];

		const member = await this.prismaService.member.findUnique({
			where: {
				id: req.params.id,
			},
			include: {
				memberRoles: true,
			},
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		const resource = {
			kind: "internal:members",
			id: "*",
			attr: {
				...member,
				memberRoles: member.memberRoles.map((role) => role.id),
				createdAt: member.createdAt.toISOString(),
				updatedAt: member.updatedAt.toISOString(),
			},
		};
		const checkResourceRequest: CheckResourceRequest = {
			principal: principal,
			resource: {
				kind: "internal:members",
				id: "*",
				attr: resource,
			},
			actions: actions,
		};
		const decision = await cerbos.checkResource(checkResourceRequest);

		const result = !!decision.isAllowed("remove");

		return result;
	}
}
