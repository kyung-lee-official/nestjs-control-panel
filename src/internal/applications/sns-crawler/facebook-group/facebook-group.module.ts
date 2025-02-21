import { Module } from "@nestjs/common";
import { FacebookGroupService } from "./facebook-group.service";
import { FacebookGroupController } from "./facebook-group.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [FacebookGroupController],
	providers: [FacebookGroupService],
})
export class FacebookGroupModule {}
