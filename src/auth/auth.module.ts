import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { Role } from "src/roles/entities/role.entity";
import { GoogleOAuth20Strategy } from "./strategies/google-oauth20.strategy";
import { Group } from "src/groups/entities/group.entity";
import { ServerSetting } from "src/server-settings/entities/server-setting.entity";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([
			User,
			Role,
			Group,
			ServerSetting
		]),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				// expiresIn: 60 * 60 * 24
				expiresIn: 60 * 60 * 2
			}
		}),
		UsersModule,
		ServerSetting
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		GoogleOAuth20Strategy
	]
})
export class AuthModule { }
