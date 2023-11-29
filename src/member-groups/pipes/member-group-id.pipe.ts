import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import validator from 'validator';

@Injectable()
export class GroupIdPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		if (!validator.isNumeric(value, { no_symbols: true })) {
			throw new BadRequestException("The id be an unsigned numeric string");
		}
		return value;
	}
}
