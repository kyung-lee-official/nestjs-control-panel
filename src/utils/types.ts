import { Member } from "@prisma/client";

export type MemberWithoutPassword = Omit<Member, "password">;
