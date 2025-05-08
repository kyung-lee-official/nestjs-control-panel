import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { JwtModule } from "@nestjs/jwt";
import { LogModule } from "../log/log.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";
import { ResendModule } from "src/resend/resend.module";

@Module({
	imports: [
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: "24h" },
		}),
		PrismaModule,
		ResendModule,
		EmailModule,
		LogModule,
		UtilsModule,
		CerbosModule,
	],
	controllers: [AuthenticationController],
	providers: [AuthenticationService],
})
export class AuthenticationModule {}
