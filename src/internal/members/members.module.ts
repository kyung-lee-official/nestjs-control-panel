import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { EmailModule } from "../email/email.module";

@Module({
	imports: [PrismaModule, AuthenticationModule, EmailModule],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
