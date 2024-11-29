import { Module } from "@nestjs/common";
import { PerformancesService } from "./performances.service";
import { PerformancesController } from "./performances.controller";
import { EventTemplatesModule } from "./event-templates/event-templates.module";
import { SectionsModule } from "./sections/sections.module";
import { EventsModule } from "./events/events.module";

@Module({
	controllers: [PerformancesController],
	providers: [PerformancesService],
	imports: [EventTemplatesModule, SectionsModule, EventsModule],
})
export class PerformancesModule {}
