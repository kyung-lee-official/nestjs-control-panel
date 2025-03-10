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

export type ChannelInfoStruct = {
	channelId: string;
	channelTitle: string;
	viewCount: number;
	/* YouTube API doesn't respond info of some channels, for example, channel id UCtD0k7G4PjhcLK9WBc97Mbw */
	subscriberCount: number;
	videoCount: number;
};

export type VideoInfoStruct = {
	videoId: string;
	title: string;
	description: string;
	durationAsSeconds: number;
	viewCount: number;
	likeCount: number;
	favoriteCount: number;
	commentCount: number;
};

export type CommentInfoStruct = SearchResultStruct & {
	commentTexts: string[];
};

export type FrequencyWordsInfoStruct = {
	row: number;
	keyword: string;
	words: any[];
};
