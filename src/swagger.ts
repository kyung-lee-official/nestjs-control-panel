import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MembersModule } from "./internal/members/members.module";
import { RolesModule as InternalRolesModule } from "./internal/roles/roles.module";
import { AuthenticationModule } from "./internal/authentication/authentication.module";
import { ServerModule } from "./internal/server/server.module";
import { EmailModule } from "./internal/email/email.module";
import { EventTemplatesModule } from "./internal/applications/performances/event-templates/event-templates.module";
import { StatsModule } from "./internal/applications/performances/stats/stats.module";
import { EventsModule } from "./internal/applications/performances/events/events.module";
import { FacebookGroupModule } from "./internal/applications/sns-crawler/facebook-group/facebook-group.module";
import { YoutubeDataCollectorModule } from "./internal/applications/sns-crawler/youtube-data-collector/youtube-data-collector.module";

export function setupSwagger(app: INestApplication<any>) {
	const membersOption = new DocumentBuilder()
		.setTitle("Internal")
		.setDescription("# The API description for the internal module")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const membersDocument = SwaggerModule.createDocument(app, membersOption, {
		include: [
			ServerModule,
			AuthenticationModule,
			EmailModule,
			MembersModule,
			InternalRolesModule,
		],
	});
	SwaggerModule.setup("api/internal", app, membersDocument);

	const applicationsOption = new DocumentBuilder()
		.setTitle("Applications")
		.setDescription("# The API description for the internal module")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const applicationsDocument = SwaggerModule.createDocument(
		app,
		applicationsOption,
		{
			include: [
				StatsModule,
				EventTemplatesModule,
				EventsModule,
				FacebookGroupModule,
				YoutubeDataCollectorModule,
			],
		}
	);
	SwaggerModule.setup("api/applications", app, applicationsDocument);
}
