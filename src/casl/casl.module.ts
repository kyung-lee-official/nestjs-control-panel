import { Module } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl-ability.factory/casl-ability.factory";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "../members/entities/member.entity";
import { PermissionsModule } from "../permissions/permissions.module";

@Module({
	imports: [TypeOrmModule.forFeature([Member]), PermissionsModule],
	providers: [CaslAbilityFactory],
	exports: [CaslAbilityFactory],
})
export class CaslModule {}
