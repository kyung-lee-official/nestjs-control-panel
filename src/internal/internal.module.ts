import { Module } from "@nestjs/common";
import { InternalService } from "./internal.service";
import { InternalController } from "./internal.controller";
import { MembersModule } from "./members/members.module";

@Module({
	imports: [MembersModule],
	controllers: [InternalController],
	providers: [InternalService],
})
export class InternalModule {}
