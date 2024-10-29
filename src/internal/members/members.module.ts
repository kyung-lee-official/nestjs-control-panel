import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { ServerModule } from "../server/server.module";
import { EmailModule } from "../email/email.module";
import { MemberRolesModule } from "../member-roles/member-roles.module";

@Module({
	imports: [
		PrismaModule,
		AuthenticationModule,
		ServerModule,
		EmailModule,
		MemberRolesModule,
	],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
