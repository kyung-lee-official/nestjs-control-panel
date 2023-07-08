import { Module } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl-ability.factory/casl-ability.factory";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { PermissionsModule } from "../permissions/permissions.module";

@Module({
	imports: [TypeOrmModule.forFeature([User]), PermissionsModule],
	providers: [CaslAbilityFactory],
	exports: [CaslAbilityFactory],
})
export class CaslModule {}
