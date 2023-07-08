import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm/dist";
import { User } from "./entities/user.entity";
import { Role } from "../roles/entities/role.entity";
import { PermissionsModule } from "../permissions/permissions.module";
import { CaslModule } from "../casl/casl.module";
import { Group } from "../groups/entities/group.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, Group]),
		CaslModule,
		PermissionsModule,
		AuthModule,
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
