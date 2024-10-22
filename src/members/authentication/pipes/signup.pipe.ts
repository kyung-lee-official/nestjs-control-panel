import {
	PipeTransform,
	ArgumentMetadata,
	BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { SignUpDto } from "../dto/signup.dto";

export class SignUpPipe implements PipeTransform<SignUpDto, SignUpDto> {
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
