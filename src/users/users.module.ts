import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from "@nestjs/typeorm/dist";
import { User } from "./entities/user.entity";
import { Role } from "src/roles/entities/role.entity";
import { RolesModule } from "src/roles/roles.module";
import { PermissionsModule } from "src/permissions/permissions.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role]),
		RolesModule,
		PermissionsModule
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService]
})
export class UsersModule { }
