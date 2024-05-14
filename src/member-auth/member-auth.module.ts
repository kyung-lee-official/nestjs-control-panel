import { Module } from "@nestjs/common";
import { MemberAuthController } from "./member-auth.controller";
import { MemberAuthService } from "./member-auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		PrismaModule,
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: "3h",
			},
		}),
	],
	controllers: [MemberAuthController],
	providers: [MemberAuthService],
	exports: [MemberAuthService],
})
export class MemberAuthModule {}
