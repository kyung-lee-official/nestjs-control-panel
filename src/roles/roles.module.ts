import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { User } from "../users/entities/user.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role]),
		CaslModule,
		PermissionsModule,
	],
	controllers: [RolesController],
	providers: [RolesService],
	exports: [],
})
export class RolesModule {}
