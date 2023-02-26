import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from "./casl-ability.factory/casl-ability.factory";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";


@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
	],
	providers: [CaslAbilityFactory],
	exports: [CaslAbilityFactory]
})
export class CaslModule { }
