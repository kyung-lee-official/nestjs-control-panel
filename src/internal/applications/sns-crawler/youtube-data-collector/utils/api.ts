import axios from "axios";
import qs from "qs";

/**
 * https://developers.google.com/youtube/v3/docs/search
 * @param keyword keywords to search
 * @param maxResultsPerPage https://developers.google.com/youtube/v3/docs/search/list#maxResults
 * @param start https://developers.google.com/youtube/v3/docs/search/list#publishedAfter
 * @param end https://developers.google.com/youtube/v3/docs/search/list#publishedBefore
 * @param pageToken https://developers.google.com/youtube/v3/docs/search/list#pageToken
 * @returns videos found
 */
export const getSearchResults = async (
	token: string,
	keyword: string,
	maxResultsPerPage: number,
	start: string,
	end: string,
	pageToken?: string
): Promise<any> => {
	const query = qs.stringify(
		{
			key: token,
			q: keyword,
			part: ["id", "snippet"],
			type: "video",
			maxResults: maxResultsPerPage,
			publishedAfter: start,
			publishedBefore: end,
			pageToken: pageToken,
		},
		{
			encodeValuesOnly: true,
			arrayFormat: "comma",
		}
	);
	const response = await axios.get(
		`https://youtube.googleapis.com/youtube/v3/search?${query}`,
		{
			timeout: 5000,
		}
	);

	return response;
};

/**
 * https://developers.google.com/youtube/v3/docs/channels
 * @note YouTube API doesn't respond info of some channels, for example, channel id UCtD0k7G4PjhcLK9WBc97Mbw
 * @param channelIds YouTube channel Ids, maximum 50
 * @returns channel info
 */
export const getChunkifiedChannelsDetail = async (
	token: string,
	channelIds: string[]
): Promise<any> => {
	if (channelIds.length > 50) {
		throw new Error("The length of channelId can not be greater then 50.");
	}
	const query = qs.stringify(
		{
			key: token,
			id: channelIds,
			part: ["id", "snippet", "statistics"],
		},
		{
			encodeValuesOnly: true,
			arrayFormat: "comma",
		}
	);
	const res = await axios
		.get(`https://youtube.googleapis.com/youtube/v3/channels?${query}`, {
			timeout: 5000,
		})
		.catch((error) => {
			console.error(error);
			throw error;
		});
	return res.data;
};

/**
 * https://developers.google.com/youtube/v3/docs/videos
 * @param videoids YouTube video Ids, maximum 50
 * @returns video info
 */
export const getChunkifiedVideoDetails = async (
	token: string,
	videoids: string[]
): Promise<any> => {
	if (videoids.length > 50) {
		throw new Error("The length of video ids can not be greater then 50.");
	}
	const query = qs.stringify(
		{
			key: token,
			id: videoids,
			part: ["id", "contentDetails", "status", "statistics", "snippet"],
		},
		{
			encodeValuesOnly: true,
			arrayFormat: "comma",
		}
	);
	const response = await axios
		.get(`https://youtube.googleapis.com/youtube/v3/videos?${query}`, {
			timeout: 5000,
		})
		.catch((error) => {
			console.error(error);
			throw error;
		});
	return response;
};

/**
 * https://developers.google.com/youtube/v3/docs/commentThreads
 * @param maxCommentsPerPage YouTube video comments, maximum 100
 * @returns YouTube video comments
 */
export const getVideoComments = async (
	token: string,
	videoId: string,
	maxCommentsPerPage: number,
	nextPageToken?: string
): Promise<any> => {
	const query = qs.stringify(
		{
			key: token,
			videoId: videoId,
			part: ["id", "replies", "snippet"],
			maxResults: maxCommentsPerPage,
			pageToken: nextPageToken,
		},
		{
			encodeValuesOnly: true,
			arrayFormat: "comma",
		}
	);
	const response = await axios
		.get(
			`https://youtube.googleapis.com/youtube/v3/commentThreads?${query}`,
			{
				timeout: 5000,
			}
		)
		.catch((error) => {
			console.error(error);
			throw error;
		});
	return response;
};
