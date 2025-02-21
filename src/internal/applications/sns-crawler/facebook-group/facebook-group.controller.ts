import { Controller, Get, Body, Patch } from "@nestjs/common";
import { FacebookGroupService } from "./facebook-group.service";
import {
	FacebookGroupOverwriteSourceDto,
	overwriteSourceSchema,
} from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";

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

	// @Post("task")
	// async createTask() {
	// 	return await this.facebookGroupService.createTask();
	// }

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
