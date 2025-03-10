import { Module } from "@nestjs/common";
import { PerformancesService } from "./performances.service";
import { PerformancesController } from "./performances.controller";
import { EventTemplatesModule } from "./event-templates/event-templates.module";
import { SectionsModule } from "./sections/sections.module";
import { EventsModule } from "./events/events.module";
import { StatsModule } from "./stats/stats.module";

@Module({
	controllers: [PerformancesController],
	providers: [PerformancesService],
	imports: [StatsModule, EventTemplatesModule, SectionsModule, EventsModule],
})
export class PerformancesModule {}
