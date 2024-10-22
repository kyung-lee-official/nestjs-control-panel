import { Module } from "@nestjs/common";
import { MemberRolesService } from "./member-roles.service";
import { MemberRolesController } from "./member-roles.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [MemberRolesController],
	providers: [MemberRolesService],
	exports: [],
})
export class MemberRolesModule {}
