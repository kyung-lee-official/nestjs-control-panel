export type KeywordStruct = {
	row: number;
	text: string;
};

export type SearchResultStruct = {
	keyword: string;
	videoId: string;
	publishedAt: string;
	channelId: string;
};

export type ChannelInfoStruct = SearchResultStruct & {
	/* YouTube API doesn't respond info of some channels, for example, channel id UCtD0k7G4PjhcLK9WBc97Mbw */
	subscriberCount?: string;
};

export type VideoInfoStruct = ChannelInfoStruct & {
	durationAsSeconds: string;
	viewCount: string;
	likeCount: string;
	favoriteCount: string;
	commentCount: string;
	description: string;
};

export type CommentInfoStruct = SearchResultStruct & {
	commentTexts: string[];
};

export type FrequencyWordsInfoStruct = {
	row: number;
	keyword: string;
	words: any[];
};
