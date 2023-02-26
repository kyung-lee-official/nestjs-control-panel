import { Module, forwardRef } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from "./entities/group.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionsModule } from "src/permissions/permissions.module";
import { UsersModule } from "src/users/users.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Group]),
		forwardRef(() => {
			return UsersModule;
		}),
		PermissionsModule
	],
	controllers: [GroupsController],
	providers: [GroupsService],
	exports: [GroupsService]
})
export class GroupsModule { }
