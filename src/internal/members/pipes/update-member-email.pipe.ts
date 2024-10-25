import {
	PipeTransform,
	ArgumentMetadata,
	BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { UpdateMemberEmailDto } from "../dto/update-member-email.dto";

export class UpdateMemberEmailPipe
	implements PipeTransform<UpdateMemberEmailDto, UpdateMemberEmailDto>
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
