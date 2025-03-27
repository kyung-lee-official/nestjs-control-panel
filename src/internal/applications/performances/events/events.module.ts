import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [EventsController],
	providers: [EventsService],
})
export class EventsModule {}
