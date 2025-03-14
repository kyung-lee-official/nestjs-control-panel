import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { JwtModule } from "@nestjs/jwt";
import { LogModule } from "../log/log.module";

@Module({
	imports: [
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: "24h" },
		}),
		PrismaModule,
		EmailModule,
		LogModule,
	],
	controllers: [AuthenticationController],
	providers: [AuthenticationService],
})
export class AuthenticationModule {}
