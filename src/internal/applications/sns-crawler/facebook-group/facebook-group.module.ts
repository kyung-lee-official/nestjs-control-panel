import { Module } from "@nestjs/common";
import { FacebookGroupService } from "./facebook-group.service";
import { FacebookGroupController } from "./facebook-group.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UtilsModule } from "src/utils/utils.module";
import { CerbosModule } from "src/cerbos/cerbos.module";

@Module({
	imports: [PrismaModule, UtilsModule, CerbosModule],
	controllers: [FacebookGroupController],
	providers: [FacebookGroupService],
})
export class FacebookGroupModule {}
