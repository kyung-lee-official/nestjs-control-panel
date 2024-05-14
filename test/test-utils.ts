import util from "util";

export function inspect(object: any) {
	return util.inspect(object, { depth: null, colors: true });
}
