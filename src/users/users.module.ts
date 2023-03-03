import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from "@nestjs/typeorm/dist";
import { User } from "./entities/user.entity";
import { Role } from "src/roles/entities/role.entity";
import { PermissionsModule } from "src/permissions/permissions.module";
import { CaslModule } from "src/casl/casl.module";
import { Group } from "src/groups/entities/group.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, Group]),
		CaslModule,
		PermissionsModule,
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService]
})
export class UsersModule { }
