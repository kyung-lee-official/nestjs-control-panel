import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { EmailModule } from "../email/email.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";
import { ResendModule } from "src/resend/resend.module";

@Module({
	imports: [
		PrismaModule,
		AuthenticationModule,
		EmailModule,
		UtilsModule,
		CerbosModule,
		ResendModule,
	],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
