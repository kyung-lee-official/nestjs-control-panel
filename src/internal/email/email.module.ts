import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [EmailController],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
