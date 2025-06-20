import { Module } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerController } from "./server.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";
import { ResendModule } from "src/resend/resend.module";

@Module({
	imports: [
		PrismaModule,
		EmailModule,
		UtilsModule,
		CerbosModule,
		ResendModule,
	],
	controllers: [ServerController],
	providers: [ServerService],
})
export class ServerModule {}
