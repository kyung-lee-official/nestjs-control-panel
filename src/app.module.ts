import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { ChituboxManualFeedbacksModule } from "./internal/applications/chitubox-manual-feedbacks/chitubox-manual-feedbacks.module";
import { PaypalModule } from "./paypal/paypal.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { RequesterMiddleware } from "./middleware/requester.middleware";
import { InternalModule } from "./internal/internal.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		InternalModule,
		ChituboxManualFeedbacksModule,
		PaypalModule,
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
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequesterMiddleware).forRoutes("*");
	}
}
