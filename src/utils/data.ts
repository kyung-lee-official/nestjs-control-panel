export function exclude<Entity, Key extends keyof Entity>(
	member: Entity,
	keys: Key[]
): Omit<Entity, Key> {
	const entries = Object.entries(member).filter(([key]) => {
		return !keys.includes(key as Key);
	});
	const object = Object.fromEntries(entries);
	return object as Omit<Entity, Key>;
}

export function excludePassword(object: any) {
	for (const key in object) {
		if (key === "password") {
			delete object["password"];
		}
		if (key === "members") {
			for (const member of object["members"]) {
				excludePassword(member);
			}
		}
		if (typeof object[key] === "object") {
			excludePassword(object[key]);
		}
	}
	return object;
}
