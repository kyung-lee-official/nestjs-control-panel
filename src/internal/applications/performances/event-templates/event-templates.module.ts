import { Module } from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import { EventTemplatesController } from "./event-templates.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [EventTemplatesController],
	providers: [EventTemplatesService],
})
export class EventTemplatesModule {}
