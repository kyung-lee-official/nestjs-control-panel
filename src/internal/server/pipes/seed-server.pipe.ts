import {
	PipeTransform,
	ArgumentMetadata,
	BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { SeedServerDto } from "../dto/seed-server.dto";

export class SeedServerPipe
	implements PipeTransform<SeedServerDto, SeedServerDto>
{
	constructor(private schema: ZodSchema) {}

	transform(value: unknown, metadata: ArgumentMetadata) {
		try {
			const parsedValue = this.schema.parse(value);
			return parsedValue;
		} catch (error) {
			throw new BadRequestException(
				(error as ZodError).errors[0].message
			);
		}
	}
}
