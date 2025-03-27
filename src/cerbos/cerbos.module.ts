import { Module } from "@nestjs/common";
import { CerbosService } from "./cerbos.service";

@Module({
	providers: [CerbosService],
	exports: [CerbosService],
})
export class CerbosModule {}
