import { Module } from "@nestjs/common";
import { MemberAuthController } from "./member-auth.controller";
import { MemberAuthService } from "./member-auth.service";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "../members/entities/member.entity";
import { ConfigModule } from "@nestjs/config";
import { MemberRole } from "../member-roles/entities/member-role.entity";
import { MemberGroup } from "../member-groups/entities/member-group.entity";
import { MemberServerSetting } from "../member-server-settings/entities/member-server-setting.entity";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forFeature([
			Member,
			MemberRole,
			MemberGroup,
			MemberServerSetting,
		]),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: "3h",
			},
		}),
		MemberServerSetting,
	],
	controllers: [MemberAuthController],
	providers: [MemberAuthService],
	exports: [MemberAuthService],
})
export class MemberAuthModule {}
