import { ApiBodyOptions } from "@nestjs/swagger";
import { YouTubeDataSearchDto } from "../dto/youtube-data-search.dto";
import dayjs from "dayjs";

export class YouTubeDataSearch {
	taskId: number;
	start: string;
	end: string;
	targetResultCount: number;

	constructor(dto: YouTubeDataSearchDto) {
		this.taskId = dto.taskId;
		this.start = dto.start;
		this.end = dto.end;
		this.targetResultCount = dto.targetResultCount;
	}
}

export const youtubeDataSearchBodyOptions: ApiBodyOptions = {
	type: YouTubeDataSearch,
	examples: {
		test: {
			value: {
				taskId: 1,
				/* a month back */
				start: dayjs().subtract(1, "month").toDate(),
				end: new Date(),
				targetResultCount: 500,
			},
		},
	},
};
