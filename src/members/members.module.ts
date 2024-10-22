import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthenticationModule } from "./authentication/authentication.module";
import { ServerModule } from "./server/server.module";
import { EmailModule } from "./email/email.module";

@Module({
	imports: [
		PrismaModule,
		CaslModule,
		PermissionsModule,
		AuthenticationModule,
		ServerModule,
		EmailModule,
	],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
