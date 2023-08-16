import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { Role } from "../roles/entities/role.entity";
import { GoogleOAuth20Strategy } from "./strategies/google-oauth20.strategy";
import { Group } from "../groups/entities/group.entity";
import { ServerSetting } from "../server-settings/entities/server-setting.entity";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([User, Role, Group, ServerSetting]),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				// expiresIn: 60 * 60 * 24
				expiresIn: 60 * 60 * 2 + 60 * 2,
			},
		}),
		ServerSetting,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, GoogleOAuth20Strategy],
	exports: [AuthService],
})
export class AuthModule {}
