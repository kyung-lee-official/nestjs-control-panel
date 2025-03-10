import { getChunkifiedChannelsDetail } from "./api";
import { chunkify } from "./chunkify";
import { ChannelInfoStruct } from "./types";

export async function getChannelsDetail(
	token: string,
	channelIds: string[]
): Promise<ChannelInfoStruct[]> {
	const channelInfoStack: ChannelInfoStruct[] = [];
	const chunkifiedChannelIds = chunkify(channelIds, 50);
	for (const chunk of chunkifiedChannelIds) {
		// console.log(`Fetching ${chalk.bgBlue(" channel ")} info of the following channels:`);
		// console.log(util.inspect(chunk, { showHidden: true, depth: null, colors: true, breakLength: Infinity }));
		let chunkChannelInfo: any;
		chunkChannelInfo = await getChunkifiedChannelsDetail(token, chunk);
		if (chunkChannelInfo.items) {
			for (const item of chunkChannelInfo.items) {
				const viewCount = Number.isInteger(
					parseInt(item.statistics.viewCount)
				)
					? BigInt(item.statistics.viewCount)
					: BigInt(0);
				const subscriberCount = item.statistics.hiddenSubscriberCount
					? BigInt(0)
					: BigInt(item.statistics.subscriberCount);
				const videoCount = Number.isInteger(
					parseInt(item.statistics.videoCount)
				)
					? BigInt(item.statistics.videoCount)
					: BigInt(0);
				channelInfoStack.push({
					channelId: item.id,
					channelTitle: item.snippet.title,
					viewCount: viewCount,
					subscriberCount: subscriberCount,
					videoCount: videoCount,
				});
			}
		}
	}
	// for (const video of searchResultData) {
	// 	const channelInfo = channelInfoStack.find((channelInfo) => {
	// 		return channelInfo.channelId === video.channelId;
	// 	});
	// 	if (channelInfo) {
	// 		combinedStack.push({
	// 			...video,
	// 			subscriberCount: channelInfo.subscriberCount,
	// 		});
	// 	}
	// }
	return channelInfoStack;
}
