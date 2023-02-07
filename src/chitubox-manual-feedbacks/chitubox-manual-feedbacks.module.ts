import { Module } from '@nestjs/common';
import { ChituboxManualFeedbacksService } from './chitubox-manual-feedbacks.service';
import { ChituboxManualFeedbacksController } from './chitubox-manual-feedback.controller';

@Module({
  controllers: [ChituboxManualFeedbacksController],
  providers: [ChituboxManualFeedbacksService]
})
export class ChituboxManualFeedbacksModule {}
