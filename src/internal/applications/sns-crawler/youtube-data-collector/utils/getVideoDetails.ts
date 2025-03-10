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
				const viewCount = Number.isInteger(
					parseInt(item.statistics.viewCount)
				)
					? BigInt(item.statistics.viewCount)
					: BigInt(0);
				const likeCount = Number.isInteger(
					parseInt(item.statistics.likeCount)
				)
					? BigInt(item.statistics.likeCount)
					: BigInt(0);
				const favoriteCount = Number.isInteger(
					parseInt(item.statistics.favoriteCount)
				)
					? BigInt(item.statistics.favoriteCount)
					: BigInt(0);
				const commentCount = Number.isInteger(
					parseInt(item.statistics.commentCount)
				)
					? BigInt(item.statistics.commentCount)
					: BigInt(0);

				videoInfoStack.push({
					videoId: item.id,
					title: item.snippet.title,
					description: item.snippet.description,
					durationAsSeconds: dayjs
						.duration(item.contentDetails.duration)
						.asSeconds(),
					viewCount: viewCount,
					likeCount: likeCount,
					favoriteCount: favoriteCount,
					commentCount: commentCount,
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
