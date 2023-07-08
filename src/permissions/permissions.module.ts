import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { User } from "../users/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [PermissionsController],
	providers: [PermissionsService],
	exports: [PermissionsService],
})
export class PermissionsModule {}
