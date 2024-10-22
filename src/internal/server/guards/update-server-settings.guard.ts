import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GRPC as Cerbos } from "@cerbos/grpc";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class UpdateServerSettingsGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const requester = req.requester;
		const principal = {
			...requester,
			createdAt: requester.createdAt.toISOString(),
			updatedAt: requester.updatedAt.toISOString(),
		};
		const resource =
			await this.prismaService.memberServerSetting.findFirst();

		const action = "update";
		const cerbosObject = {
			principal: {
				id: requester.id,
				roles: requester.memberRoles.map((role) => role.id),
				attributes: principal,
			},
			resource: {
				kind: "member:server-settings",
				id: `${resource.id}`,
			},
			actions: [action],
		};
		const decision = await cerbos.checkResource(cerbosObject);
		const result = !!decision.isAllowed(action);

		return result;
	}
}
