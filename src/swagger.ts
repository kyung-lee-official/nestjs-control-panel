import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MembersModule } from "./members/members.module";
import { MemberRolesModule } from "./member-roles/member-roles.module";
import { AuthenticationModule } from "./members/authentication/authentication.module";
import { ServerModule } from "./members/server/server.module";
import { EmailModule } from "./members/email/email.module";

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
		.setTitle("members")
		.setDescription("# The members API description")
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
	SwaggerModule.setup("api/members", app, membersDocument);
}
