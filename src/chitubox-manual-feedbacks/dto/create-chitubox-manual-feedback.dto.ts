import { IsEnum, IsUrl } from "class-validator";
import { ChituboxManualUrl } from "../chitubox-manual-url.enum";
import { ChituboxManualFeedbackPayload } from "../chitubox-manual-feedback-payload.enum";

export class CreateChituboxManualFeedbackDto {
	@IsUrl()
	url: ChituboxManualUrl;

	@IsEnum(ChituboxManualFeedbackPayload)
	payload: ChituboxManualFeedbackPayload;
}
