import { Injectable } from "@nestjs/common";
import { FacebookGroupOverwriteSourceDto } from "./dto/facebook-group-overwrite-source.dto";
import { FacebookGroupUpdateSourceDto } from "./dto/facebook-group-update-source.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FacebookGroupService {
	constructor(private readonly prismaService: PrismaService) {}
	async overwriteSource(
		facebookGroupOverwriteSourceDto: FacebookGroupOverwriteSourceDto
	) {
		await this.prismaService.facebookGroupSource.deleteMany();
		return await this.prismaService.facebookGroupSource.createMany({
			data: facebookGroupOverwriteSourceDto,
		});
	}

	async updateSource(
		facebookGroupUpdateSourceDto: FacebookGroupUpdateSourceDto
	) {
		return await this.prismaService.facebookGroupSource.update({
			where: {
				groupAddress: facebookGroupUpdateSourceDto.groupAddress,
			},
			data: facebookGroupUpdateSourceDto,
		});
	}

	async getSource() {
		return await this.prismaService.facebookGroupSource.findMany();
	}

	// async createTask() {
	// 	return await this.prismaService.facebookGroupCrawlTask.create({
	// 		data: {
	// 			records: {
	// 				create: [],
	// 			},
	// 			isAborted: false,
	// 		},
	// 	});
	// }

	// async update(id: number, updateFacebookGroupDto: OverFacebookGroupDto) {
	// 	return await `This action updates a #${id} facebookGroup`;
	// }

	// async remove(id: number) {
	// 	return await `This action removes a #${id} facebookGroup`;
	// }
}
