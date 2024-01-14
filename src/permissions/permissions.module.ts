import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { Member } from "../members/entities/member.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
	imports: [TypeOrmModule.forFeature([Member])],
	controllers: [PermissionsController],
	providers: [PermissionsService, PermissionsGuard],
	exports: [PermissionsService],
})
export class PermissionsModule {}
