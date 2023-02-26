import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from "@nestjs/typeorm/dist";
import { User } from "./entities/user.entity";
import { Role } from "src/roles/entities/role.entity";
import { PermissionsModule } from "src/permissions/permissions.module";
import { forwardRef } from "@nestjs/common/utils";
import { RolesModule } from "src/roles/roles.module";
import { GroupsModule } from "src/groups/groups.module";
import { CaslModule } from "src/casl/casl.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role]),
		forwardRef(() => {
			return RolesModule;
		}),
		forwardRef(() => {
			return GroupsModule;
		}),
		forwardRef(() => CaslModule),
		CaslModule,
		PermissionsModule,
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService]
})
export class UsersModule { }
