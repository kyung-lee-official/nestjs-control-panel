import { Module } from "@nestjs/common";
import { RetailGateway } from "./retail.gateway";

@Module({
	providers: [RetailGateway],
	exports: [RetailGateway],
})
export class RetailGatewayModule {}
