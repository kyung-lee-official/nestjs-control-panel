import { Module } from "@nestjs/common";
import { InternalService } from "./internal.service";
import { InternalController } from "./internal.controller";
import { MembersModule } from "./members/members.module";
import { ServerModule } from "./server/server.module";
import { RolesModule } from "./roles/roles.module";

@Module({
	imports: [MembersModule, ServerModule, RolesModule],
	controllers: [InternalController],
	providers: [InternalService],
})
export class InternalModule {}
