import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from "./casl-ability.factory/casl-ability.factory";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { PermissionsModule } from "src/permissions/permissions.module";


@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		PermissionsModule
	],
	providers: [CaslAbilityFactory],
	exports: [CaslAbilityFactory]
})
export class CaslModule { }
