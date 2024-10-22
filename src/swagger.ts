import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MembersModule } from "./internal/members/members.module";
import { MemberRolesModule } from "./internal/member-roles/member-roles.module";
import { AuthenticationModule } from "./internal/authentication/authentication.module";
import { ServerModule } from "./internal/server/server.module";
import { EmailModule } from "./internal/email/email.module";

export function setupSwagger(app: INestApplication<any>) {
	const memberRolesOption = new DocumentBuilder()
		.setTitle("member-roles")
		.setDescription("# The member-roles API description")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const memberRolesDocument = SwaggerModule.createDocument(
		app,
		memberRolesOption,
		{
			include: [MemberRolesModule],
		}
	);
	SwaggerModule.setup("api/member-roles", app, memberRolesDocument);

	// const memberServerSettingsOption = new DocumentBuilder()
	// 	.setTitle("member-server-settings")
	// 	.setDescription("# The member-server-settings API description")
	// 	.setVersion("1.0.0")
	// 	.build();
	// const memberServerSettingsDocument = SwaggerModule.createDocument(
	// 	app,
	// 	memberServerSettingsOption,
	// 	{
	// 		include: [MemberServerSettingsModule],
	// 	}
	// );
	// SwaggerModule.setup(
	// 	"api/member-server-settings",
	// 	app,
	// 	memberServerSettingsDocument
	// );

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
		],
	});
	SwaggerModule.setup("api/internal", app, membersDocument);
}
