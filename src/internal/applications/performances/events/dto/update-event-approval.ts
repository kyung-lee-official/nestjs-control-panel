import { z } from "zod";

export const updateApprovalDtoSchema = z.object({
	approval: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export type UpdateApprovalDto = z.infer<typeof updateApprovalDtoSchema>;
