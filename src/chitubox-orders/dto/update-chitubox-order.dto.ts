import { PartialType } from '@nestjs/mapped-types';
import { CreateChituboxOrderDto } from './create-chitubox-order.dto';

export class UpdateChituboxOrderDto extends PartialType(CreateChituboxOrderDto) {}
