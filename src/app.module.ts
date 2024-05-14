import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MembersModule } from "./members/members.module";
import { MemberAuthModule } from "./member-auth/member-auth.module";
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
import { PrismaModule } from "./prisma/prisma.module";
import { RequesterMiddleware } from "./middleware/requester.middleware";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
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
		PrismaModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequesterMiddleware).forRoutes("*");
	}
}
