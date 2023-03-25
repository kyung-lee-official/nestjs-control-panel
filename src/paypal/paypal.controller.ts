import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CompletePaypalOrderDto } from "./dto/complete-paypal-order.dto";

@Controller('paypal')
export class PaypalController {
	constructor(private readonly paypalService: PaypalService) { }

	@Post()
	createOrder(@Body() createPaypalDto: CreatePaypalOrderDto) {
		return this.paypalService.createOrder(createPaypalDto);
	}

	@Post("/completeOrder")
	completeOrder(@Body() createPaypalDto: CompletePaypalOrderDto) {
		return this.paypalService.completeOrder(createPaypalDto);
	}

	@Get()
	findAll() {
		return this.paypalService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.paypalService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updatePaypalDto: any) {
		return this.paypalService.update(+id, updatePaypalDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.paypalService.remove(+id);
	}
}
