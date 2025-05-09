import { Module } from "@nestjs/common";
import { ResendService } from "./resend.service";
import { ResendController } from "./resend.controller";
import { ApiTags } from "@nestjs/swagger";
import { PrismaModule } from "src/prisma/prisma.module";

@ApiTags("resend")
@Module({
	imports: [PrismaModule],
	controllers: [ResendController],
	providers: [ResendService],
	exports: [ResendService],
})
export class ResendModule {}
