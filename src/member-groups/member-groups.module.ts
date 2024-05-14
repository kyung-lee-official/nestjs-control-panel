import { Module } from "@nestjs/common";
import { MemberGroupsService } from "./member-groups.service";
import { GroupsController } from "./member-groups.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule, PermissionsModule, CaslModule],
	controllers: [GroupsController],
	providers: [MemberGroupsService],
	exports: [MemberGroupsService],
})
export class MemberGroupsModule {}
