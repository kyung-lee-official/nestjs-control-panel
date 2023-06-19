import { IsEnum, IsString, IsUrl, Matches } from "class-validator";
import { ChituboxManualFeedbackPayload } from "../chitubox-manual-feedback-payload.enum";

export class CreateChituboxManualFeedbackDto {
	@IsString()
	pageId: string;

	@IsUrl()
	@Matches(/manual\.chitubox\.com/, {
		message: "Illegal URL",
	})	
	url: string;

	@IsEnum(ChituboxManualFeedbackPayload)
	payload: ChituboxManualFeedbackPayload;
}
