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

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([User, Role]),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: 3600 * 24
			}
		}),
		UsersModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy
	]
})
export class AuthModule { }
