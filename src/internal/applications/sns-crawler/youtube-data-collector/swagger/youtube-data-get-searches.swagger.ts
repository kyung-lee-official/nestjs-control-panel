import { ApiBodyOptions } from "@nestjs/swagger";
import { YouTubeDataGetSearchesDto } from "../dto/youtube-data-get-searches.dto";

export class YouTubeDataSearch {
	taskId: number;
	keyword: string;

	constructor(dto: YouTubeDataGetSearchesDto) {
		this.taskId = dto.taskId;
		this.keyword = dto.keyword;
	}
}

export const youtubeDataGetSearchesBodyOptions: ApiBodyOptions = {
	type: YouTubeDataSearch,
	examples: {
		test: {
			value: {
				taskId: 1,
				keyword: "3d print",
			},
		},
	},
};
