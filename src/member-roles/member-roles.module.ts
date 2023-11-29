import { Module } from "@nestjs/common";
import { MemberRolesService } from "./member-roles.service";
import { MemberRolesController } from "./member-roles.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberRole } from "./entities/member-role.entity";
import { Member } from "../members/entities/member.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Member, MemberRole]),
		CaslModule,
		PermissionsModule,
	],
	controllers: [MemberRolesController],
	providers: [MemberRolesService],
	exports: [],
})
export class MemberRolesModule { }
