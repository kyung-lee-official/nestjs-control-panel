import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { MemberAuthModule } from "../member-auth/member-auth.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule, CaslModule, PermissionsModule, MemberAuthModule],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
