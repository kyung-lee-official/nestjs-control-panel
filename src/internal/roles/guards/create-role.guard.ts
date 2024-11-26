import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../../prisma/prisma.service";
import { getCerbosPrincipal } from "src/utils/data";
import { GRPC as Cerbos } from "@cerbos/grpc";
import { CheckResourceRequest } from "@cerbos/core";

const cerbos = new Cerbos(process.env.CERBOS_HOST as string, { tls: false });

@Injectable()
export class CreateRoleGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		if (req.body.id === "admin") {
			throw new BadRequestException("Role ID cannot be 'admin'");
		}
		if (req.body.id === "default") {
			throw new BadRequestException("Role ID cannot be 'default'");
		}

		const requester = req.requester;
		const principal = getCerbosPrincipal(requester);

		const actions = ["create"];

		const resource = {
			kind: "internal:roles",
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
