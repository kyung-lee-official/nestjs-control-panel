import { IsEnum, IsUrl, Matches } from "class-validator";
import { ChituboxManualFeedbackPayload } from "../chitubox-manual-feedback-payload.enum";

export class CreateChituboxManualFeedbackDto {
	@IsUrl()
	@Matches(/manual\.chitubox\.com/, {
		message: "Illegal URL"
	})
	url: string;

	@IsEnum(ChituboxManualFeedbackPayload)
	payload: ChituboxManualFeedbackPayload;
}
