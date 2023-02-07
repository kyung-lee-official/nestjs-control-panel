import { Injectable } from '@nestjs/common';
import { CreateDiscordDrawRecordDto } from './dto/create-discord-draw-record.dto';
import { UpdateDiscordDrawRecordDto } from './dto/update-discord-draw-record.dto';

@Injectable()
export class DiscordDrawRecordsService {
  create(createDiscordDrawRecordDto: CreateDiscordDrawRecordDto) {
    return 'This action adds a new discordDrawRecord';
  }

  findAll() {
    return `This action returns all discordDrawRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discordDrawRecord`;
  }

  update(id: number, updateDiscordDrawRecordDto: UpdateDiscordDrawRecordDto) {
    return `This action updates a #${id} discordDrawRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} discordDrawRecord`;
  }
}
