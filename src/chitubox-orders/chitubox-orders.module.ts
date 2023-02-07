import { Module } from '@nestjs/common';
import { ChituboxOrdersService } from './chitubox-orders.service';
import { ChituboxOrdersController } from './chitubox-orders.controller';

@Module({
  controllers: [ChituboxOrdersController],
  providers: [ChituboxOrdersService]
})
export class ChituboxOrdersModule {}
