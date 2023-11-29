import { Module } from "@nestjs/common";
import { MemberGroupsService } from "./member-groups.service";
import { GroupsController } from "./member-groups.controller";
import { MemberGroup } from "./entities/member-group.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionsModule } from "../permissions/permissions.module";
import { Member } from "../members/entities/member.entity";
import { CaslModule } from "../casl/casl.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([MemberGroup, Member]),
		PermissionsModule,
		CaslModule,
	],
	controllers: [GroupsController],
	providers: [MemberGroupsService],
	exports: [MemberGroupsService],
})
export class MemberGroupsModule { }
