import { ApiOperationOptions } from "@nestjs/swagger";

export const youtubeDataStartTaskByIdOperationOptions: ApiOperationOptions = {
	summary: "Start task by id",
	description:
		"Start task by id, only pending and failed keywords will be searched.",
};
