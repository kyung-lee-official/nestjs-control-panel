import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MembersModule } from "./internal/members/members.module";
import { RolesModule as InternalRolesModule } from "./internal/roles/roles.module";
import { AuthenticationModule } from "./internal/authentication/authentication.module";
import { ServerModule } from "./internal/server/server.module";
import { EmailModule } from "./internal/email/email.module";

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
}
