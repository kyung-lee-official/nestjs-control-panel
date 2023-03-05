import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, }),
	],
	controllers: [PaypalController],
	providers: [PaypalService]
})
export class PaypalModule { }
