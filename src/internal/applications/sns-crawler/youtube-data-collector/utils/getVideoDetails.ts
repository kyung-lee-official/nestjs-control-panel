import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import { getChunkifiedVideoDetails } from "./api.js";
import { chunkify } from "./chunkify.js";
import { VideoInfoStruct } from "./types.js";

export async function getVideosDetail(
	token: string,
	videoIds: string[]
): Promise<VideoInfoStruct[]> {
	const videoInfoStack: VideoInfoStruct[] = [];
	const chunkifiedVideoIds = chunkify(videoIds, 50);
	for (const chunk of chunkifiedVideoIds) {
		// console.log(
		// 	`Fetching ${chalk.bgBlue(" video ")} info of the following videos:`
		// );
		// console.log(
		// 	util.inspect(chunk, {
		// 		showHidden: true,
		// 		depth: null,
		// 		colors: true,
		// 		breakLength: Infinity,
		// 	})
		// );
		const chunkVideoInfo = await getChunkifiedVideoDetails(token, chunk);
		if (chunkVideoInfo.data.items) {
			for (const item of chunkVideoInfo.data.items) {
				videoInfoStack.push({
					videoId: item.id,
					title: item.snippet.title,
					description: item.snippet.description,
					durationAsSeconds: dayjs
						.duration(item.contentDetails.duration)
						.asSeconds(),
					viewCount: parseInt(item.statistics.viewCount) || 0,
					likeCount: parseInt(item.statistics.likeCount) || 0,
					favoriteCount: parseInt(item.statistics.favoriteCount) || 0,
					commentCount: parseInt(item.statistics.commentCount) || 0,
				});
			}
		}
	}
	// for (const video of searchResultData) {
	// 	const videoInfo = videoInfoStack.find((videoInfo) => {
	// 		return videoInfo.videoId === video.videoId;
	// 	});
	// 	if (videoInfo) {
	// 		let combinedData = {
	// 			...video,
	// 			...videoInfo,
	// 		};
	// 		if (!combinedData.viewCount) {
	// 			combinedData = { ...combinedData, viewCount: "0" };
	// 		}
	// 		if (!combinedData.likeCount) {
	// 			combinedData = { ...combinedData, likeCount: "0" };
	// 		}
	// 		if (!combinedData.favoriteCount) {
	// 			combinedData = { ...combinedData, favoriteCount: "0" };
	// 		}
	// 		if (!combinedData.commentCount) {
	// 			combinedData = { ...combinedData, commentCount: "0" };
	// 		}
	// 		combinedStack.push(combinedData);
	// 	}
	// }
	return videoInfoStack;
}
