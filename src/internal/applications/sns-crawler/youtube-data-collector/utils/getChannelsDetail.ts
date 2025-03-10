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
				channelInfoStack.push({
					channelId: item.id,
					channelTitle: item.snippet.title,
					viewCount: parseInt(item.statistics.viewCount),
					subscriberCount: item.statistics.hiddenSubscriberCount
						? 0
						: parseInt(item.statistics.subscriberCount),
					videoCount: parseInt(item.statistics.videoCount),
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
