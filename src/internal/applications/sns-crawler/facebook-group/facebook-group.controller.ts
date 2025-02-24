import {
	Controller,
	Get,
	Body,
	Patch,
	Post,
	Param,
	ParseIntPipe,
} from "@nestjs/common";
import { FacebookGroupService } from "./facebook-group.service";
import {
	FacebookGroupOverwriteSourceDto,
	overwriteSourceSchema,
} from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { ApiOperation } from "@nestjs/swagger";

@Controller("internal/applications/facebook-group")
export class FacebookGroupController {
	constructor(private readonly facebookGroupService: FacebookGroupService) {}

	@Patch("overwrite-source")
	async overwriteSource(
		@Body(new ZodValidationPipe(overwriteSourceSchema))
		facebookGroupOverwriteSourceDto: FacebookGroupOverwriteSourceDto
	) {
		return await this.facebookGroupService.overwriteSource(
			facebookGroupOverwriteSourceDto
		);
	}

	@Patch("update-source")
	async updateSource(
		@Body() facebookGroupUpdateSourceDto: FacebookGroupUpdateSourceDto
	) {
		return await this.facebookGroupService.updateSource(
			facebookGroupUpdateSourceDto
		);
	}

	@Get("source")
	async getSource() {
		return await this.facebookGroupService.getSource();
	}

	@Post("start-task")
	async startTask() {
		return await this.facebookGroupService.startTask();
	}

	@Get("tasks")
	async getTasks() {
		return await this.facebookGroupService.getTasks();
	}

	@ApiOperation({
		summary: "Get task by id, can be used to pool task status",
	})
	@Get("task/:taskId")
	async getTaskById(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.facebookGroupService.getTaskById(taskId);
	}

	@Post("abort-task/:taskId")
	async abortTask(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.facebookGroupService.abortTask(taskId);
	}

	@Get("status")
	async getStatus() {
		return await this.facebookGroupService.getStatus();
	}

	// @Patch(":id")
	// async update(
	// 	@Param("id") id: string,
	// 	@Body() updateFacebookGroupDto: UpdateFacebookGroupDto
	// ) {
	// 	return this.facebookGroupService.update(+id, updateFacebookGroupDto);
	// }

	// @Delete(":id")
	// async remove(@Param("id") id: string) {
	// 	return this.facebookGroupService.remove(+id);
	// }
}
