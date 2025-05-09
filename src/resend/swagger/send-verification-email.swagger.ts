import { ApiOperationOptions } from "@nestjs/swagger";

export const sendVerificationEmailOperationOptions: ApiOperationOptions = {
	description: `# Send a Verification Email to the Member
Send a verification email to the member. Valid for 1 day.`,
};
