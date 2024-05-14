import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MembersModule } from "./members/members.module";
import { MemberAuthModule } from "./member-auth/member-auth.module";
import { MemberGroupsModule } from "./member-groups/member-groups.module";
import { MemberRolesModule } from "./member-roles/member-roles.module";
import { MemberServerSettingsModule } from "./member-server-settings/member-server-settings.module";

export function setupSwagger(app: INestApplication<any>) {
	const memberAuthOption = new DocumentBuilder()
		.setTitle("member-auth")
		.setDescription("# The member-auth API description")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const memberAuthDocument = SwaggerModule.createDocument(
		app,
		memberAuthOption,
		{
			include: [MemberAuthModule],
		}
	);
	SwaggerModule.setup("api/member-auth", app, memberAuthDocument);

	const memberGroupsOption = new DocumentBuilder()
		.setTitle("member-groups")
		.setDescription("# The member-groups API description")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const memberGroupsDocument = SwaggerModule.createDocument(
		app,
		memberGroupsOption,
		{
			include: [MemberGroupsModule],
		}
	);
	SwaggerModule.setup("api/member-groups", app, memberGroupsDocument);

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

	const memberServerSettingsOption = new DocumentBuilder()
		.setTitle("member-server-settings")
		.setDescription("# The member-server-settings API description")
		.setVersion("1.0.0")
		.build();
	const memberServerSettingsDocument = SwaggerModule.createDocument(
		app,
		memberServerSettingsOption,
		{
			include: [MemberServerSettingsModule],
		}
	);
	SwaggerModule.setup(
		"api/member-server-settings",
		app,
		memberServerSettingsDocument
	);

	const membersOption = new DocumentBuilder()
		.setTitle("members")
		.setDescription("# The members API description")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	const membersDocument = SwaggerModule.createDocument(app, membersOption, {
		include: [MembersModule],
	});
	SwaggerModule.setup("api/members", app, membersDocument);
}
