import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { DiscordDrawCampaignsModule } from "./discord-draw-campaigns/discord-draw-campaigns.module";
import { DiscordDrawRecordsModule } from "./discord-draw-records/discord-draw-records.module";
import { ChituboxOrdersModule } from "./chitubox-orders/chitubox-orders.module";
import { ChituboxManualFeedbacksModule } from "./chitubox-manual-feedbacks/chitubox-manual-feedbacks.module";
import { GroupsModule } from "./groups/groups.module";
import { CaslModule } from "./casl/casl.module";
import { PaypalModule } from "./paypal/paypal.module";
import { ServerSettingsModule } from "./server-settings/server-settings.module";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(
			process.env.ENV === "DEV"
				? {
						type: "postgres",
						host: process.env.DATABASE_HOST_DEV,
						port: parseInt(process.env.DATABASE_PORT_DEV),
						username: process.env.DATABASE_USERNAME_DEV,
						password: process.env.DATABASE_PASSWORD_DEV,
						database: process.env.DATABASE_DEV,
						autoLoadEntities: true,
						synchronize: true,
				  }
				: {
						type: "postgres",
						host: process.env.DATABASE_HOST,
						port: parseInt(process.env.DATABASE_PORT),
						username: process.env.DATABASE_USERNAME,
						password: process.env.DATABASE_PASSWORD,
						database: process.env.DATABASE,
						autoLoadEntities: true,
						synchronize: true,
				  }
		),
		UsersModule,
		AuthModule,
		RolesModule,
		GroupsModule,
		PermissionsModule,
		DiscordDrawCampaignsModule,
		DiscordDrawRecordsModule,
		ChituboxOrdersModule,
		ChituboxManualFeedbacksModule,
		CaslModule,
		PaypalModule,
		ServerSettingsModule,
		MailerModule.forRoot({
			transport: {
				service: "qq",
				port: 587,
				secure: true,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASSWORD,
				},
			},
			// defaults: {
			// 	from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>`,
			// },
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
