import { Injectable } from '@nestjs/common';
import { CreateChituboxOrderDto } from './dto/create-chitubox-order.dto';
import { UpdateChituboxOrderDto } from './dto/update-chitubox-order.dto';

@Injectable()
export class ChituboxOrdersService {
  create(createChituboxOrderDto: CreateChituboxOrderDto) {
    return 'This action adds a new chituboxOrder';
  }

  findAll() {
    return `This action returns all chituboxOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chituboxOrder`;
  }

  update(id: number, updateChituboxOrderDto: UpdateChituboxOrderDto) {
    return `This action updates a #${id} chituboxOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} chituboxOrder`;
  }
}
