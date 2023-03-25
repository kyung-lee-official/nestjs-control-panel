import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from "./entities/group.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionsModule } from "src/permissions/permissions.module";
import { User } from "src/users/entities/user.entity";
import { CaslModule } from "src/casl/casl.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Group, User]),
		PermissionsModule,
		CaslModule
	],
	controllers: [GroupsController],
	providers: [GroupsService],
	exports: [GroupsService]
})
export class GroupsModule { }
