import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { User } from "src/users/entities/user.entity";
import { PermissionsModule } from "src/permissions/permissions.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role]),
		PermissionsModule
	],
	controllers: [RolesController],
	providers: [RolesService],
	exports: [RolesService]
})
export class RolesModule { }
