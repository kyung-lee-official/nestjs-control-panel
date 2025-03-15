import {
	Controller,
	Get,
	Body,
	Patch,
	Post,
	Param,
	ParseIntPipe,
	Delete,
	UseGuards,
} from "@nestjs/common";
import { FacebookGroupService } from "./facebook-group.service";
import {
	FacebookGroupOverwriteSourceDto,
	overwriteSourceSchema,
} from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/internal/authentication/guards/jwt.guard";

@ApiTags("Facebook Group Crawler")
@ApiBearerAuth()
@UseGuards(JwtGuard)
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

	@Post("create-task")
	async createTask() {
		return await this.facebookGroupService.createTask();
	}

	@Post("start-crawling/:taskId")
	async crawl(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.facebookGroupService.crawl(taskId);
	}

	@Post("recrawl-failed-records/:taskId")
	async recrawlFailedRecords(@Param("taskId", ParseIntPipe) taskId: number) {
		return await this.facebookGroupService.recrawlFailedRecords(taskId);
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

	@Post("abort-task")
	async abortTask() {
		return await this.facebookGroupService.abortTask();
	}

	@Get("status")
	async getStatus() {
		return await this.facebookGroupService.getStatus();
	}

	@Delete("delete-task/:taskId")
	async remove(@Param("taskId", ParseIntPipe) taskId: number) {
		return this.facebookGroupService.remove(taskId);
	}

	// @Patch(":id")
	// async update(
	// 	@Param("id") id: string,
	// 	@Body() updateFacebookGroupDto: UpdateFacebookGroupDto
	// ) {
	// 	return this.facebookGroupService.update(+id, updateFacebookGroupDto);
	// }
}
