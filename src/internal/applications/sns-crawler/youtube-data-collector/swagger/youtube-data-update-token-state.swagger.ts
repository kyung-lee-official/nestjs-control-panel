import { ApiBodyOptions, ApiOperationOptions } from "@nestjs/swagger";
import { YouTubeDataUpdateTokenStateDto } from "../dto/youtube-data-update-token-state.dto";

export class YouTubeDataUpdateTokenState {
	recentlyUsedToken?: string;
	oldToken?: string;

	constructor(dto: YouTubeDataUpdateTokenStateDto) {
		this.recentlyUsedToken = dto.recentlyUsedToken;
		this.oldToken = dto.oldToken;
	}
}

export const youtubeDataUpdateTokenStateOperationOptions: ApiOperationOptions =
	{
		summary: "Update token state",
		description:
			"Update token state, if 'recentlyUsedToken' is provided, it will be used as the new token. If 'oldToken' is provided, it will be marked as run out of quota and set a run out of quota time. A new token in the token list will be used as 'recentlyUsedToken' as long as its 'quotaRunOutAt' is earlier than a month ago.",
	};

export const youtubeDataUpdateTokenStateBodyOptions: ApiBodyOptions = {
	type: YouTubeDataUpdateTokenState,
	examples: {
		test: {
			value: {
				recentlyUsedToken: "<KEY>",
				oldToken: "<KEY>",
			},
		},
	},
};
