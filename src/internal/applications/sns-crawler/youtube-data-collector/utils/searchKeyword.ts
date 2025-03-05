// import { log } from "../helper/log.js";
import util from "util";
import { SearchResultStruct } from "./types.js";
import { getSearchResults } from "./api.js";

export async function searchKeyword(
	token: string,
	keyword: string,
	start: string,
	end: string,
	targetResultCount: number
): Promise<SearchResultStruct[]> {
	const maxResultsPerPage = 50; /* 50 results per page is the maximum allowed by YouTube */
	let resultStack: SearchResultStruct[] = [];

	async function recursiveSearch(
		keyword: string,
		targetResultCount: number,
		maxResultsPerPage: number,
		start: string,
		end: string,
		currentSearchResultNumber?: number,
		nextPageToken?: string,
		currentPageNumber?: number
	): Promise<void> {
		currentSearchResultNumber = nextPageToken
			? currentSearchResultNumber
			: 0;
		currentPageNumber = currentPageNumber ? currentPageNumber + 1 : 1;
		// console.log(`Current keyword: ${chalk.bgGreen(` ${keyword.text} `)}, current page: ${currentPageNumber}`);
		let pageResults;
		if (nextPageToken) {
			pageResults = await getSearchResults(
				token,
				keyword,
				maxResultsPerPage,
				start,
				end,
				nextPageToken
			);
		} else {
			pageResults = await getSearchResults(
				token,
				keyword,
				maxResultsPerPage,
				start,
				end
			);
		}
		currentSearchResultNumber += pageResults.data.pageInfo.resultsPerPage;
		if (currentSearchResultNumber) {
			/* At least one video found */
			const videoIds: string[] = [];
			for (const video of pageResults.data.items) {
				/* Get search result of the current video */
				const searchResult: SearchResultStruct = {
					keyword: keyword,
					videoId: video.id.videoId,
					// title: video.snippet.title,
					publishedAt: video.snippet.publishedAt,
					channelId: video.snippet.channelId,
					// channelTitle: video.snippet.channelTitle,
				};
				resultStack.push(searchResult);
				videoIds.push(video.id.videoId);
			}
			console.log(
				util.inspect(videoIds, {
					showHidden: true,
					depth: null,
					colors: true,
					breakLength: Infinity,
				})
			);
			/* Check recurse conditions */
			if (targetResultCount > currentSearchResultNumber) {
				if (
					pageResults.data.pageInfo.resultsPerPage < maxResultsPerPage
				) {
					/* Last page */
				} else {
					await recursiveSearch(
						keyword,
						targetResultCount,
						maxResultsPerPage,
						start,
						end,
						currentSearchResultNumber,
						pageResults.data.nextPageToken,
						currentPageNumber
					);
				}
			}
		} else {
			/* TODO: no result found */
		}
	}
	await recursiveSearch(
		keyword,
		targetResultCount,
		maxResultsPerPage,
		start,
		end
	);
	return resultStack;
}
