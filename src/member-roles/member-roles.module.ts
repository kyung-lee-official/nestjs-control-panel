import { Module } from "@nestjs/common";
import { MemberRolesService } from "./member-roles.service";
import { MemberRolesController } from "./member-roles.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule, CaslModule, PermissionsModule],
	controllers: [MemberRolesController],
	providers: [MemberRolesService],
	exports: [],
})
export class MemberRolesModule {}
