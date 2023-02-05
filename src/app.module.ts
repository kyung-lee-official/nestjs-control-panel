import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, }),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE,
			autoLoadEntities: true,
			synchronize: false
		}),
		UsersModule,
		AuthModule,
		RolesModule,
		PermissionsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
