import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MembersModule } from "./members/members.module";
import { MemberAuthModule } from "./member-auth/member-auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MemberRolesModule } from "./member-roles/member-roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { ChituboxManualFeedbacksModule } from "./chitubox-manual-feedbacks/chitubox-manual-feedbacks.module";
import { MemberGroupsModule } from "./member-groups/member-groups.module";
import { CaslModule } from "./casl/casl.module";
import { PaypalModule } from "./paypal/paypal.module";
import { MemberServerSettingsModule } from "./member-server-settings/member-server-settings.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { DevtoolsModule } from "@nestjs/devtools-integration";

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
		MembersModule,
		MemberAuthModule,
		MemberRolesModule,
		MemberGroupsModule,
		PermissionsModule,
		ChituboxManualFeedbacksModule,
		CaslModule,
		PaypalModule,
		MemberServerSettingsModule,
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
		DevtoolsModule.register({
			http: true,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
