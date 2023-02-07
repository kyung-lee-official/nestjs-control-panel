import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChituboxOrdersService } from './chitubox-orders.service';
import { CreateChituboxOrderDto } from './dto/create-chitubox-order.dto';
import { UpdateChituboxOrderDto } from './dto/update-chitubox-order.dto';

@Controller('chitubox-orders')
export class ChituboxOrdersController {
  constructor(private readonly chituboxOrdersService: ChituboxOrdersService) {}

  @Post()
  create(@Body() createChituboxOrderDto: CreateChituboxOrderDto) {
    return this.chituboxOrdersService.create(createChituboxOrderDto);
  }

  @Get()
  findAll() {
    return this.chituboxOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chituboxOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChituboxOrderDto: UpdateChituboxOrderDto) {
    return this.chituboxOrdersService.update(+id, updateChituboxOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chituboxOrdersService.remove(+id);
  }
}
