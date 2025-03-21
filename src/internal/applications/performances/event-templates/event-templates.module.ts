import { Module } from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import { EventTemplatesController } from "./event-templates.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";

@Module({
	imports: [PrismaModule, UtilsModule],
	controllers: [EventTemplatesController],
	providers: [EventTemplatesService],
})
export class EventTemplatesModule {}
