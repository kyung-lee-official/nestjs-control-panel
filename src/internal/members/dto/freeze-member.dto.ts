import { z } from "zod";

export class FreezeMember {
	isFrozen: boolean;
	constructor(isFrozen: boolean) {
		this.isFrozen = isFrozen;
	}
}

export const freezeMemberSchema = z.object({
	isFrozen: z.boolean(),
});

export type FreezeMemberDto = z.infer<typeof freezeMemberSchema>;
