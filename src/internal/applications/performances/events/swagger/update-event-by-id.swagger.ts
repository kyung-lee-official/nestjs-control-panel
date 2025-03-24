import { ApiOperationOptions } from "@nestjs/swagger";

export const updateEventByIdApiOperationOptions: ApiOperationOptions = {
	summary: "Update event by id",
	description:
		"update an event's `score`, `amount` (optional), and `description`",
};
