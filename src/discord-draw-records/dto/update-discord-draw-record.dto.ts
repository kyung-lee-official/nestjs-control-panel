import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscordDrawRecordDto } from './create-discord-draw-record.dto';

export class UpdateDiscordDrawRecordDto extends PartialType(CreateDiscordDrawRecordDto) {}
