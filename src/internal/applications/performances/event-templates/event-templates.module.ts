import { Module } from "@nestjs/common";
import { EventTemplatesService } from "./event-templates.service";
import { EventTemplatesController } from "./event-templates.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [EventTemplatesController],
	providers: [EventTemplatesService],
})
export class EventTemplatesModule {}
