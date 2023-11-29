import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { TypeOrmModule } from "@nestjs/typeorm/dist";
import { Member } from "./entities/member.entity";
import { MemberRole } from "../member-roles/entities/member-role.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { MemberGroup } from "../member-groups/entities/member-group.entity";
import { MemberAuthModule } from "../member-auth/member-auth.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Member, MemberRole, MemberGroup]),
		CaslModule,
		PermissionsModule,
		MemberAuthModule,
	],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule { }
