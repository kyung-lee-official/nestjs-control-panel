/**
 * This function chunkify an array into an array of chunks,
 * @example chunkify([1, 2, 3, 4, 5], 2) returns [[1, 2], [3, 4], [5]]
 * @param data an array to chunkify
 * @param size chunk size
 * @returns an chunkified array
 */
export function chunkify(data: any[], size: number) {
	if (size === 0 || size < 0) {
		return data;
	}
	const chunks: any = [];
	let chunk: any = [];
	for (let i = 0; i < data.length; i++) {
		if (i === 0) {
			chunk.push(data[i]);
		} else {
			if (i % size === 0) {
				chunks.push(chunk);
				chunk = [];
				chunk.push(data[i]);
			} else {
				chunk.push(data[i]);
			}
		}
	}
	if (chunk.length !== 0) {
		chunks.push(chunk);
	}
	return chunks;
}
